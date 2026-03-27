import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CloudPath Quiz",
  description: "How we handle your data when you take the CloudPath Quiz.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-300 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: 27 March 2026</p>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">What we collect</h2>
            <p>
              When you take the CloudPath Quiz, we collect your <strong>first name</strong> and{" "}
              <strong>email address</strong> (which you provide voluntarily at the end of the quiz).
              We also collect your quiz answers to generate your personalised career recommendation.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">How we use your data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To generate your personalised AI career recommendation</li>
              <li>To subscribe you to the Shola&apos;s Tech Notes newsletter (you can unsubscribe at any time)</li>
              <li>To tag your subscription with your quiz result so we can send relevant content</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">AI processing</h2>
            <p>
              Your quiz answers are sent to Anthropic&apos;s Claude AI to generate a personalised
              recommendation. No personally identifiable information (name or email) is sent to the
              AI model — only your anonymised answer selections.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Third-party services</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Beehiiv</strong> — newsletter platform (stores your email and name)</li>
              <li><strong>Anthropic (Claude)</strong> — AI result generation (receives anonymised quiz answers only)</li>
              <li><strong>Vercel</strong> — hosting and analytics</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Your rights</h2>
            <p>
              You can unsubscribe from the newsletter at any time using the link in any email.
              To request deletion of your data, email{" "}
              <a href="mailto:olusholaoladipupo1@gmail.com" className="text-blue-400 hover:underline">
                olusholaoladipupo1@gmail.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Cookies</h2>
            <p>
              This site uses sessionStorage (not cookies) to store your quiz progress temporarily.
              No tracking cookies are used. Vercel Analytics may collect anonymous usage data.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
            <p>
              Olushola Oladipupo<br />
              <a href="mailto:olusholaoladipupo1@gmail.com" className="text-blue-400 hover:underline">
                olusholaoladipupo1@gmail.com
              </a>
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-800">
          <a href="/" className="text-blue-400 hover:underline text-sm">
            &larr; Back to CloudPath Quiz
          </a>
        </div>
      </div>
    </main>
  );
}
