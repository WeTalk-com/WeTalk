import styles from "./error-screen.module.css";

type ErrorScreenProps = {
  /** Code HTTP affiche en grand (ideal : 3 chiffres, ex. "404", "500"). */
  code: string;
  /** Texte sur l'ecran de la TV (ex. "NOT FOUND"). */
  label: string;
};

/** Ecran d'erreur retro (TV) reutilisable pour n'importe quel code. */
export function ErrorScreen({ code, label }: ErrorScreenProps) {
  return (
    <div
      className={styles.main_wrapper}
      role="img"
      aria-label={`Error ${code}: ${label}`}
    >
      <div className={styles.main}>
        <div className={styles.antenna}>
          <div className={styles.antenna_shadow} />
          <div className={styles.a1} />
          <div className={styles.a1d} />
          <div className={styles.a2} />
          <div className={styles.a2d} />
          <div className={styles.a_base} />
        </div>
        <div className={styles.tv}>
          <div className={styles.cruve}>
            <svg
              className={styles.curve_svg}
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 189.929 189.929"
              xmlSpace="preserve"
            >
              <path d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13 C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z" />
            </svg>
          </div>
          <div className={styles.display_div}>
            <div className={styles.screen_out}>
              <div className={styles.screen_out1}>
                <div className={styles.screen}>
                  <span className={styles.notfound_text}>{label}</span>
                </div>
                <div className={styles.screenM}>
                  <span className={styles.notfound_text}>{label}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.lines}>
            <div className={styles.line1} />
            <div className={styles.line2} />
            <div className={styles.line3} />
          </div>
          <div className={styles.buttons_div}>
            <div className={styles.b1}>
              <div />
            </div>
            <div className={styles.b2} />
            <div className={styles.speakers}>
              <div className={styles.g1}>
                <div className={styles.g11} />
                <div className={styles.g12} />
                <div className={styles.g13} />
              </div>
              <div className={styles.g} />
              <div className={styles.g} />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.base1} />
          <div className={styles.base2} />
          <div className={styles.base3} />
        </div>
      </div>
      <div className={styles.text_404} aria-hidden>
        {code.split("").map((digit, i) => (
          <div key={i} className={styles.digit}>
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
}
