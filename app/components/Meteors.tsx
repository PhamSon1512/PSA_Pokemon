import { useDarkMode } from 'usehooks-ts';

export const Meteors = ({ number }: { number?: number }) => {
  const meteors = new Array(number || 20).fill(true);
  const { isDarkMode } = useDarkMode();

  if (!isDarkMode) return null;

  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={'meteor' + idx}
          className="meteor"
          style={{
            top: 0,
            left: Math.floor(Math.random() * (1200 - -1200) + -1200) + 'px',
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + 's',
          }}
        ></span>
      ))}
    </>
  );
};
