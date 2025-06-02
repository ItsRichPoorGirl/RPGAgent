import { SectionHeader } from '@/components/home/section-header';
import { siteConfig } from '@/lib/home';
import { Github, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function OpenSourceSection() {
  return (
    <section
      id="open-source"
      className="flex flex-col items-center justify-center w-full relative pb-18"
    >
      <div className="w-full max-w-6xl mx-auto px-6">
        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance pb-1">
            100% Open Source
          </h2>
          <p className="text-muted-foreground text-center text-balance max-w-lg">
            Luciq is fully open source. Join our community and help shape the
            future of AI automation.
          </p>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12">
          <div className="rounded-xl bg-[#F3F4F6] dark:bg-[#F9FAFB]/[0.02] border border-border p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Github className="h-5 w-5" />
                <span>ItsRichPoorGirl/Luciq-AI-Agent</span>
              </div>
              <div className="relative">
                <h3 className="text-2xl font-semibold tracking-tight">
                  The Generalist AI Agent
                </h3>
                <p className="text-muted-foreground mt-2">
                  Explore, contribute, or fork our repository. Luciq is built
                  with transparency and collaboration at its core.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 border-secondary/20 text-secondary">
                  TypeScript
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 border-secondary/20 text-secondary">
                  Python
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 border-secondary/20 text-secondary">
                  Apache 2.0 License
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" asChild>
              <Link
                    href="https://github.com/ItsRichPoorGirl/Luciq-AI-Agent"
                target="_blank"
                rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Star on GitHub
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link
                    href="https://github.com/ItsRichPoorGirl/Luciq-AI-Agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    View Source
              </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#F3F4F6] dark:bg-[#F9FAFB]/[0.02] border border-border p-6">
            <div className="flex flex-col gap-6">
              <h3 className="text-xl md:text-2xl font-medium tracking-tight">
                Transparency & Trust
              </h3>
              <p className="text-muted-foreground">
                We believe AI should be open and accessible to everyone. Our
                open source approach ensures accountability, innovation, and
                community collaboration.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-secondary/10 p-2 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-secondary"
                    >
                      <path
                        d="M9.75 12.75L11.25 14.25L14.25 9.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Transparency</h4>
                    <p className="text-muted-foreground text-sm">
                      Fully auditable codebase
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-secondary/10 p-2 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-secondary"
                    >
                      <path
                        d="M9.75 12.75L11.25 14.25L14.25 9.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Community</h4>
                    <p className="text-muted-foreground text-sm">
                      Join our developers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-secondary/10 p-2 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-secondary"
                    >
                      <path
                        d="M9.75 12.75L11.25 14.25L14.25 9.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Apache 2.0</h4>
                    <p className="text-muted-foreground text-sm">
                      Free to use and modify
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
