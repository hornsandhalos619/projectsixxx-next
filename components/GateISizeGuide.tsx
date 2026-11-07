import React from "react";
import { GATE_I_MEASUREMENTS, GATE_I_PRODUCT_URL, GATE_I_SIZE_SOURCE } from "@/config/gate-i-size";

export function GateISizeGuide() {
  return (
    <section className="section" id="gate-i-size-guide" aria-labelledby="gate-i-size-title">
      <p className="kicker">Gate I</p>
      <h2 id="gate-i-size-title">Size guide</h2>
      <p className="muted">
        The Unbroken Ring — Gate I Tee is sold in S, M, L, XL, and 2XL. The live Shopify variants
        are Printful Bella + Canvas 3001 in black (catalog variant ids 4016 through 4020). Chest
        and body length below are garment measurements, in inches, from the Bella + Canvas style
        3001 specification.
      </p>
      <div className="spec-table">
        <table>
          <caption>Bella + Canvas 3001 garment measurements for Gate I sizes</caption>
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Chest</th>
              <th scope="col">Body length from HPS</th>
            </tr>
          </thead>
          <tbody>
            {GATE_I_MEASUREMENTS.map((row) => (
              <tr key={row.size}>
                <th scope="row">{row.size}</th>
                <td>{row.chestInches}</td>
                <td>{row.bodyLengthFromHpsInches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        <a href={GATE_I_SIZE_SOURCE.url} rel="noopener noreferrer" target="_blank">
          {GATE_I_SIZE_SOURCE.label}
        </a>
        . The manufacturer notes that this chart can change.
      </p>
      <p>
        <a href={GATE_I_PRODUCT_URL} rel="noopener noreferrer" target="_blank">
          The Unbroken Ring — Gate I Tee
        </a>
      </p>
    </section>
  );
}
