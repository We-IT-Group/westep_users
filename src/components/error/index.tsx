import { Link } from "react-router-dom";

export default function Error() {
  return (
    <div className="academy-card mx-auto my-12 max-w-lg space-y-4 p-10 text-center">
      <img src="/academy/westy.png" alt="Westy" className="mx-auto h-28 w-28 object-contain" />
      <h2>Sahifa topilmadi</h2>
      <p className="academy-quiet">Bunday sahifa yo‘q yoki ko‘chirib yuborilgan.</p>
      <Link to="/" className="academy-cta academy-cta-brand">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
