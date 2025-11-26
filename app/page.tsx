import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to Shukuma
          </h1>
          <p className="text-xl text-foreground/70 mb-8">
            Your personal fitness tracking companion
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-md mx-auto md:max-w-none">
            <a
              href="/login"
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i>
              Login
            </a>
            <a
              href="/register"
              className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-user-plus"></i>
              Register
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
