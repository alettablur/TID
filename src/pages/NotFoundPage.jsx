import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button.jsx";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  function goHome() {
    navigate("/");
  }

  return (
    <>
      <h1 className="t-screen-title">No such page</h1>
      <p className="not-found-page__text t-body">
        This address does not lead anywhere in Unload.
      </p>
      <Button onClick={goHome}>Back to Home</Button>
    </>
  );
}
