import PreviewNotice from "@/components/shared/PreviewNotice";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PreviewNotice />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
