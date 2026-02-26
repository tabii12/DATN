import { GoogleOAuthProvider } from "@react-oauth/google";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dmv7ymjxf/image/upload/v1772087221/mesut-kaya-eOcyhe5-9sQ-unsplash_1_h0flh9.png')",
      }}
    >
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          {children}
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}
