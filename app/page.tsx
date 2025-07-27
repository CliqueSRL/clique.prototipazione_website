"use client";
import React, { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";

export const metadata = {
  title: "Prototipazione - CliqueSRL",
  description:
    "Proto-Clique è il tuo partner per la progettazione e stampa 3D. Condividi il tuo progetto e ricevi un'offerta personalizzata.",
  openGraph: {
    title: "Prototipazione - CliqueSRL",
    description:
      "Proto-Clique è il tuo partner per la progettazione e stampa 3D. Condividi il tuo progetto e ricevi un'offerta personalizzata.",
  },
};

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "fail">(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [fileError, setFileError] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setFileError(false);
    }
  };

  useEffect(() => {
    let canvas = document.getElementById("stars") as HTMLCanvasElement | null;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "stars";
      document.getElementById("background")?.appendChild(canvas);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let stars: {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
    }[] = [];

    function generateStars() {
      stars = Array.from({ length: 120 }, () => {
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 0.5 + 0.2;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 1.1 + 0.2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: Math.random() * 0.8 + 0.2,
        };
      });
    }

    function handleResize() {
      const dpr = window.devicePixelRatio || 1;
      w = (canvas!.width = window.innerWidth * dpr);
      h = (canvas!.height = window.innerHeight * dpr);
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      generateStars();
    }

    function draw() {
      ctx!.fillStyle = "#0d0d0d";
      ctx!.fillRect(0, 0, w, h);

      for (const star of stars) {
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    let mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: 300,
    };

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    window.addEventListener("mousemove", onMouseMove);

    function animate() {
      for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;

        const dx = star.x - mouse.x;
        const dy = star.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          star.x += Math.cos(angle) * 2;
          star.y += Math.sin(angle) * 2;
        }

        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;
      }
      draw();
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      canvas?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollIndicator(window.scrollY < 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, radius: 80 };

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setFileError(true);
      return;          // blocca l’invio
    }

    setSending(true);
    setSent(null);
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSent("ok");
        form.reset();
        setSelectedFiles([]);
        setTimeout(() => setIsHiding(true), 1400);
        setTimeout(() => {
          setSent(null);
          setIsHiding(false);
        }, 2100);
      } else {
        setSent("fail");
        setErrorMsg(data.error || "Errore sconosciuto");
      }
    } catch (err) {
      setSent("fail");
      setErrorMsg("Errore di rete");
    } finally {
      setSending(false);
    }
  };

  const handleCopy = (text: string) => {
    if (
      typeof window !== "undefined" &&
      navigator &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      navigator.clipboard.writeText(text).catch(() => {
        window.prompt("Per questioni di sicurezza, copia manualmente:", text);
      });
    } else if (typeof window !== "undefined") {
      window.prompt("Per questioni di sicurezza, copia manualmente:", text);
    } else {
      alert("La funzione copia non è supportata dal tuo browser.");
    }
  };

  return (
    <main>
      {/* HERO */}
      <section className="hero" style={{ position: "relative" }}>
        <h1>Proto-Clique</h1>
        <p>
          Il tuo partner per la <strong>Progettazione</strong> e la{" "}
          <strong>
            <span className="nowrap">Stampa 3d</span>
          </strong>
        </p>
        {showScrollIndicator && <div className="scroll-indicator" />}
      </section>

      {/* Contatto diretto */}
      <section className="contact">
        <h2>Hai una nuova idea?</h2>
        <p>Confrontati con noi per realizzarla al meglio</p>
        <div className="buttons">
          <button
            type="button"
            onClick={() => {
              setShowPhone(true);
              setShowMail(false);
            }}
          >
            Chiamaci
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMail(true);
              setShowPhone(false);
            }}
          >
            Manda una e-mail
          </button>
        </div>
        {(showPhone || showMail) && (
          <div className="contact-popup">
            {showPhone && (
              <div className="contact-link-box">
                <a href="tel:+393664760593" className="contact-link">
                  +39 366 476 0593
                </a>
                <button
                  className="copy-btn"
                  aria-label="Copia numero"
                  type="button"
                  onClick={() => handleCopy("+393664760593")}
                >
                  <FiCopy size={20} />
                </button>
              </div>
            )}
            {showMail && (
              <div className="contact-link-box">
                <a href="mailto:prototipazione@cliquesrl.it" className="contact-link">
                  prototipazione@cliquesrl.it
                </a>
                <button
                  className="copy-btn"
                  aria-label="Copia email"
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleCopy("prototipazione@cliquesrl.it");
                  }}
                >
                  <FiCopy size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Upload progetto */}
      <section className={`upload${sent ? " expanded" : ""}`}>
        <h2>Hai già un progetto?</h2>
        <p>Condividilo con noi per poterti fare un'offerta</p>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-row">
            <input type="text" name="name" placeholder="Il tuo nome *" required />
            <input type="email" name="email" placeholder="La tua email *" required />
            <input
              type="tel"
              name="phone"
              placeholder="Numero di telefono (opz.)"
              pattern="[0-9+\s()-]{6,}"
            />
          </div>

          <div className="file-upload-row">
            <label htmlFor="file" className="file-btn small">
              Scegli file *
            </label>
            <input
              type="file"
              name="file"
              id="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                handleFileChange(e);
                setFileError(false);
              }}
            />
            {selectedFiles.length > 0 && (
              <ul className="file-list">
                {selectedFiles.map((file, idx) => (
                  <li
                    key={idx}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => {
                        setSelectedFiles(selectedFiles => selectedFiles.filter((_, i) => i !== idx));
                      }}
                      aria-label={`Rimuovi ${file.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {fileError && (
              <p className="field-error" aria-live="polite">
                È obbligatorio caricare almeno un file
              </p>
            )}
            <div style={{ marginBottom: 10, color: "#bbb", fontSize: "0.98rem" }}>
              <br />Scrivi la <strong>Quantità</strong> di ogni pezzo nel nome del file rispettando questo formato:<br />
              <strong>q.ta - nome file</strong>. <br />Esempio: <br />
              <strong>4 - flangia forata</strong>
            </div>
          </div>
          <textarea
            name="message"
            placeholder="Descrivi il tuo progetto..."
            rows={6}
            style={{ resize: "none" }} // disabilito la possibilità di resize
          />
          <button type="submit" disabled={sending}>
            {sending ? "Invio in corso..." : "Invia progetto"}
          </button>
        </form>
        {sent === "ok" && (
          <div className={`form-feedback success${isHiding ? " hide" : ""}`}>
            <div className="checkmark-animation">
              <svg width="60" height="60">
                <circle cx="30" cy="30" r="28" fill="none" stroke="#4caf50" strokeWidth="4" />
                <polyline
                  points="18,32 28,42 44,22"
                  fill="none"
                  stroke="#4caf50"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>Progetto inviato con successo!</div>
          </div>
        )}
        {sent === "fail" && (
          <div className="form-feedback error">
            <div>
              Invio non riuscito.<br />
              {errorMsg}
            </div>
            <div style={{ marginTop: 8 }}>
              Prova a <a href="tel:+393664760593">chiamarci</a>!
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-bio">
          <p>
            <strong>Proto-Clique</strong> nasce come spin-off di Clique, sviluppata inizialmente per rispondere
            all’esigenza interna di prototipazione rapida. Col tempo, l’expertise maturata è stata estesa anche a
            clienti esterni, dando vita a un ramo dedicato all’ideazione e realizzazione agile di soluzioni su misura.
          </p>
        </div>
        <hr />
        <div className="footer-info">
          <p>Clique S.r.l. — Via Roberto da Sanseverino, 95, 38122 Trento (TN)</p>
          <p>P. IVA / C.F.: 02745810222</p>
          <p>Tel: +39 366 476 0593 · Email: amministrazione@cliquesrl.it</p>
        </div>
      </footer>
    </main>
  );
}
