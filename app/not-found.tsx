import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell page-head">
      <p className="kicker">Void</p>
      <h1>This door is not for you.</h1>
      <p className="lede">No such room — or it is hidden. The house does not grey things out.</p>
      <div className="cta-row">
        <Link className="btn btn-house" href="/">
          Return to the house
        </Link>
      </div>
    </div>
  );
}
