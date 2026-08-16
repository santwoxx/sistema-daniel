function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const tamanhos = {
  sm: { caixa: "h-10 w-10 rounded-xl text-xl", icone: 20 },
  md: { caixa: "h-12 w-12 rounded-xl text-2xl", icone: 24 },
  lg: { caixa: "h-14 w-14 rounded-2xl text-3xl", icone: 28 },
};

/**
 * Marca do produto: uma águia estilizada (traço único, asas abertas) dentro
 * do quadrado dourado usado em toda a identidade visual. Um único componente
 * evita reimplementar o mesmo marcador em cada tela (login, navbar, link de
 * avaliação) com risco de divergir.
 */
export function Logo({
  tamanho = "md",
  className,
}: {
  tamanho?: keyof typeof tamanhos;
  className?: string;
}) {
  const { caixa, icone } = tamanhos[tamanho];
  return (
    <span
      className={cx(
        "flex shrink-0 items-center justify-center bg-linear-to-br from-gold to-gold-hover text-white shadow-sm shadow-gold/30",
        caixa,
        className
      )}
    >
      <svg
        width={icone}
        height={icone}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 14c4-5.5 7.5-7 10-3 2.5-4 6-2.5 10 3"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 11v8.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
