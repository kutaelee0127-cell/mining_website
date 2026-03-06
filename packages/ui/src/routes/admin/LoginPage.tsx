import { useState } from "react";

export interface LoginPageProps {
  t: (key: string) => string;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function LoginPage({ t, onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  return (
    <section>
      <h1>{t("msg.loginTitle")}</h1>
      <p>{t("msg.loginSubtitle")}</p>
      <label>
        {t("field.username")}
        <input value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label>
        {t("field.password")}
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button
        type="button"
        onClick={async () => {
          const ok = await onLogin(username, password);
          setError(!ok);
        }}
      >
        {t("action.login")}
      </button>
      {error ? <p>{t("err.unauthorized")}</p> : null}
    </section>
  );
}
