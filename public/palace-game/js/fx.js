// Fire, embers, smoke, candle flames, cloth sway, portal. All GPU-animated with one shared time uniform.
import * as THREE from 'three';

export const U = { uTime: { value: 0 }, uPR: { value: 1 } };

const NOISE = /* glsl */`
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*vnoise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
`;

// ---------- Flames: camera-facing (cylindrical) billboards with an fbm flame ----------
const flameGeo = new THREE.PlaneGeometry(1, 1, 1, 1).translate(0, 0.5, 0);
export function flameMaterial(seed = 0, intensity = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uSeed: { value: seed }, uInt: { value: intensity } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vec3 c = (modelMatrix*vec4(0.,0.,0.,1.)).xyz;
        vec3 sx = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), 0.);
        vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
        vec3 wp = c + right*position.x*sx.x + vec3(0.,1.,0.)*position.y*sx.y;
        gl_Position = projectionMatrix*viewMatrix*vec4(wp,1.);
      }`,
    fragmentShader: NOISE + /* glsl */`
      uniform float uTime, uSeed, uInt; varying vec2 vUv;
      void main(){
        vec2 uv=vUv; float t=uTime*1.9+uSeed*13.;
        float n=fbm(vec2(uv.x*3.2+uSeed, uv.y*2.4-t));
        float n2=fbm(vec2(uv.x*6.1-uSeed, uv.y*4.6-t*1.35));
        float x=(uv.x-.5)*2.;
        float w=mix(.95,.04,pow(uv.y,.75));
        float sh=1.-smoothstep(w*.45,w,abs(x+(n-.5)*.7*uv.y));
        float f=sh*((1.-uv.y)*1.35-n2*.65*uv.y);
        f=clamp(f*1.7,0.,1.)*smoothstep(0.,.06,uv.y);
        vec3 col=mix(vec3(.55,.04,0.),vec3(1.,.42,.04),smoothstep(.05,.45,f));
        col=mix(col,vec3(1.,.8,.45),smoothstep(.7,1.,f));
        gl_FragColor=vec4(col*f*uInt*1.25,f);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}
export function makeFire({ width = 1, height = 1.2, count = 4, intensity = 1 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(flameGeo, flameMaterial(Math.random() * 10, intensity));
    const s = 0.65 + Math.random() * 0.45;
    m.scale.set(width * (count > 1 ? 0.55 : 1) * s, height * s, 1);
    m.position.set((count > 1 ? (i / (count - 1) - 0.5) : 0) * width * 0.6, 0, (Math.random() - 0.5) * width * 0.25);
    m.renderOrder = 10; m.frustumCulled = false;
    g.add(m);
  }
  return g;
}

// ---------- Soft glow sprite ----------
let glowTex;
export function glowSprite(color = 0xffa040, size = 2, opacity = 0.6) {
  if (!glowTex) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); glowTex = new THREE.CanvasTexture(c); glowTex.colorSpace = THREE.SRGBColorSpace;
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1); s.renderOrder = 9;
  return s;
}

// ---------- Particles: embers (additive) and smoke (alpha) ----------
function particleGeo(n) {
  const g = new THREE.BufferGeometry();
  const seed = new Float32Array(n * 4); for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
  return g;
}
export function makeEmbers({ origin, spread = [0.8, 0.2, 0.5], drift = [0, 0, 0], rise = 0.9, life = 3.2, size = 0.05, n = 120 }) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPR: U.uPR, uO: { value: new THREE.Vector3(...origin) }, uS: { value: new THREE.Vector3(...spread) },
      uD: { value: new THREE.Vector3(...drift) }, uRise: { value: rise }, uLife: { value: life }, uSize: { value: size } },
    vertexShader: /* glsl */`
      attribute vec4 aSeed; uniform float uTime,uPR,uRise,uLife,uSize; uniform vec3 uO,uS,uD;
      varying float vA; varying float vK; varying float vH;
      void main(){
        float life=uLife*(.55+.45*aSeed.w);
        float age=mod(uTime+aSeed.x*37.,life); float k=age/life;
        vec3 p=uO+(aSeed.xyz-.5)*uS;
        p.y+=uRise*age+.08*age*age;
        p+=uD*age*(.35+aSeed.y);
        p.x+=sin(age*2.7+aSeed.z*20.)*.22*k; p.z+=cos(age*2.1+aSeed.x*17.)*.22*k;
        vA=(1.-k)*smoothstep(0.,.06,k); vK=k; vH=.6+.4*sin(uTime*18.+aSeed.y*60.);
        vec4 mv=viewMatrix*vec4(p,1.);
        gl_PointSize=uSize*(.45+aSeed.w)*uPR*(420./max(-mv.z,.2));
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vA,vK,vH;
      void main(){ vec2 d=gl_PointCoord-.5; float r=length(d); if(r>.5) discard;
        float a=smoothstep(.5,0.,r)*vA*vH;
        vec3 c=mix(vec3(1.,.75,.3),vec3(1.,.22,.02),vK);
        gl_FragColor=vec4(c*a*1.6,a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const p = new THREE.Points(particleGeo(n), mat); p.frustumCulled = false; p.renderOrder = 11;
  return p;
}
export function makeSmoke({ origin, spread = [0.6, 0.1, 0.4], drift = [0, 0, 0], rise = 0.55, life = 6, size = 1.2, n = 40, opacity = 0.22 }) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPR: U.uPR, uO: { value: new THREE.Vector3(...origin) }, uS: { value: new THREE.Vector3(...spread) },
      uD: { value: new THREE.Vector3(...drift) }, uRise: { value: rise }, uLife: { value: life }, uSize: { value: size }, uOp: { value: opacity } },
    vertexShader: /* glsl */`
      attribute vec4 aSeed; uniform float uTime,uPR,uRise,uLife,uSize; uniform vec3 uO,uS,uD; varying float vA; varying float vR;
      void main(){ float life=uLife*(.6+.4*aSeed.w); float age=mod(uTime+aSeed.x*53.,life); float k=age/life;
        vec3 p=uO+(aSeed.xyz-.5)*uS; p.y+=uRise*age; p+=uD*age; p.x+=sin(age*.8+aSeed.z*9.)*.3*k;
        vA=smoothstep(0.,.15,k)*(1.-k); vR=aSeed.y*6.28+uTime*.2*(aSeed.z-.5);
        vec4 mv=viewMatrix*vec4(p,1.); gl_PointSize=uSize*(.4+k*1.4)*uPR*(420./max(-mv.z,.2)); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`
      uniform float uOp; varying float vA,vR;
      float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
      void main(){ vec2 d=gl_PointCoord-.5; float r=length(d); if(r>.5) discard;
        float n=.75+.25*sin(atan(d.y,d.x)*3.+vR);
        float a=smoothstep(.5,.1,r*n)*vA*uOp; gl_FragColor=vec4(vec3(.09,.08,.075),a); }`,
    transparent: true, depthWrite: false,
  });
  const p = new THREE.Points(particleGeo(n), mat); p.frustumCulled = false; p.renderOrder = 8;
  return p;
}

// ---------- Candle flames: one Points draw for every candle in the hall ----------
export function makeCandleFlames(positions, size = 0.09) {
  const n = positions.length / 3;
  const g = particleGeo(n); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPR: U.uPR, uSize: { value: size } },
    vertexShader: /* glsl */`attribute vec4 aSeed; uniform float uTime,uPR,uSize; varying float vF;
      void main(){ vF=.75+.25*sin(uTime*(9.+aSeed.x*6.)+aSeed.y*30.)*sin(uTime*3.1+aSeed.z*10.);
        vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=uSize*uPR*vF*(420./max(-mv.z,.2)); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`varying float vF; void main(){ vec2 d=gl_PointCoord-vec2(.5,.62); d.x*=1.9; d.y*= d.y>0.?1.:0.55;
      float r=length(d); float a=smoothstep(.42,0.,r); vec3 c=mix(vec3(1.,.45,.08),vec3(1.,.95,.75),smoothstep(.15,0.,r));
      gl_FragColor=vec4(c*a*vF*1.5,a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const p = new THREE.Points(g, mat); p.frustumCulled = false; p.renderOrder = 12; return p;
}

// ---------- Cloth sway (tapestries, banners): vertex displacement pinned along the top edge ----------
export function sway(material, { height, amp = 0.08, speed = 1 }) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.uTime; sh.uniforms.uH = { value: height }; sh.uniforms.uAmp = { value: amp }; sh.uniforms.uSp = { value: speed };
    const fn = /* glsl */`
      uniform float uTime,uH,uAmp,uSp;
      float swW(vec3 p){ return pow(clamp((uH*.5-p.y)/uH,0.,1.),1.15); }
      float swD(vec3 p){ float t=uTime*uSp; return uAmp*(sin(t*1.05+p.x*1.4+p.y*.8)+.38*sin(t*2.3+p.x*3.6+p.y*2.1)+.2*sin(t*.55+p.y*.6)); }
    `;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + fn)
      .replace('#include <beginnormal_vertex>', /* glsl */`
        float e=.03; vec3 P=position;
        float d0=swW(P)*swD(P);
        float dx=(swW(P+vec3(e,0,0))*swD(P+vec3(e,0,0))-d0)/e;
        float dy=(swW(P+vec3(0,e,0))*swD(P+vec3(0,e,0))-d0)/e;
        vec3 objectNormal=normalize(vec3(-dx,-dy,1.));
        #ifdef USE_TANGENT
        vec3 objectTangent=vec3(tangent.xyz);
        #endif`)
      .replace('#include <begin_vertex>', /* glsl */`vec3 transformed=position; transformed.z+=swW(position)*swD(position);`);
  };
  material.customProgramCacheKey = () => 'sway' + height + amp;
  return material;
}

// ---------- Portal: gold ring's inner face, alternating Horns (fire, crimson) and Halos (silver, gold) ----------
export function portalMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + /* glsl */`
      uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 p=vUv*2.-1.; float r=length(p); float a=atan(p.y,p.x);
        float ph=smoothstep(-.35,.35,sin(uTime*6.2831/40.));
        float sw=a+uTime*.12+r*2.6;
        vec2 q=vec2(cos(sw),sin(sw))*r*2.2;
        float n=fbm(q*1.6+vec2(0.,-uTime*.25)); float n2=fbm(q*3.5-uTime*.18);
        vec3 horns=mix(vec3(.02,0.,0.),vec3(.55,.03,.02),n)+vec3(1.,.38,.05)*pow(n2,4.)*2.2;
        vec3 halos=mix(vec3(.05,.05,.07),vec3(.42,.42,.47),n)+vec3(1.,.8,.42)*pow(n2,3.)*.8;
        vec3 c=mix(horns,halos,ph);
        c*=mix(.25,1.,smoothstep(0.,.95,r));
        c+=vec3(1.,.7,.3)*smoothstep(.85,1.,r)*.35;
        float alpha=smoothstep(1.,.97,r);
        gl_FragColor=vec4(c,alpha);
      }`,
    transparent: true, side: THREE.DoubleSide,
  });
}

// ---------- Flicker helper for lights ----------
export function flicker(t, seed) {
  return 0.78 + 0.12 * Math.sin(t * 7.3 + seed) + 0.07 * Math.sin(t * 13.1 + seed * 2.1) + 0.05 * Math.sin(t * 23.7 + seed * 3.7);
}
