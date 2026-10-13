import { Noto_Sans } from 'next/font/google';

/**
 * Font of the Clients module. Its CSS variable is set on <html> (see
 * app/layout.jsx) so module popups rendered into <body> can use it too.
 */
export const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans',
});
