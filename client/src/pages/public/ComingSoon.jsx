/**
 * pages/public/ComingSoon.jsx — placeholder for modules not yet implemented.
 */
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

export default function ComingSoon({ title = "Coming soon" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-5xl">🚧</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        This module is part of the roadmap but hasn't been built yet.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
