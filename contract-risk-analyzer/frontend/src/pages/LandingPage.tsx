import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { HudButton } from '../components/hud/HudButton';
import { HudPanel } from '../components/hud/HudPanel';
import { Badge } from '../components/ui/Badge';
import ThreatDisplay from '../components/hud/ThreatDisplay';
import { initScrollReveal, initParallaxLayer } from '../motion/scrollAnimations';
import { useHoverTilt, useMagneticHover } from '../motion/interactions';

const LandingPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  // Animations
  useEffect(() => {
    if (prefersReducedMotion) return;

    // Use specific classes for separate sections so they trigger at the right scroll positions
    const cleanupRevealSteps = initScrollReveal('.scroll-reveal-step');
    const cleanupRevealCta = initScrollReveal('.scroll-reveal-cta');
    const cleanupParallax = initParallaxLayer('.parallax-bg', 0.25);

    return () => {
      cleanupRevealSteps();
      cleanupRevealCta();
      cleanupParallax();
    };
  }, [prefersReducedMotion]);

  const { ref: magneticRef, style: magneticStyle } = useMagneticHover(80);
  const { ref: tiltRef, props: tiltProps } = useHoverTilt();

  return (
    <div
      className="min-h-screen flex flex-col w-full relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-paper, #DCEEEA)' }}
    >
      {/* Decorative Parallax Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="parallax-bg absolute top-[15%] -left-[5%] text-[400px] lg:text-[600px] font-bold opacity-[0.13] select-none tracking-tighter leading-none"
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            color: 'var(--color-ink, #12181A)',
          }}
        >
          01
        </div>
        {/* Dot grid texture */}
        <div
          className="parallax-bg absolute top-[60%] right-[5%] w-64 h-64 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--color-ink, #12181A) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        {/* Corner Brackets decoration */}
        <div className="parallax-bg absolute top-[30%] right-[20%] w-32 h-32 border-t-2 border-r-2 opacity-10 border-[var(--color-ink,#12181A)]" />
      </div>

      <Navbar
        isAuthed={false}
        navLinks={[
          { label: 'Platform',     href: '/platform' },
          { label: 'How It Works', href: '/how-it-works' },
          { label: 'Security',     href: '/security' },
        ]}
      />

      <main className="flex-1 flex flex-col relative z-10">
        {/* HERO SECTION */}
        <section className="w-full px-6 py-20 lg:py-32 max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
            {/* 60% Left Area */}
            <div className="w-full lg:w-[55%] flex flex-col items-start z-10">
              <Badge tier="neutral" className="mb-6">
                SYSTEM OPERATIONAL
              </Badge>
              <h1
                className="text-[36px] sm:text-[44px] lg:text-[52px] xl:text-[60px] font-bold leading-[1.05] tracking-tight uppercase mb-8 text-left"
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: 'var(--color-ink, #12181A)',
                }}
              >
                Identify critical
                <br />
                contract risks before
                <br />
                they compromise
                <br />
                the mission.
              </h1>
              <p
                className="text-[16px] sm:text-[18px] mb-10 max-w-xl opacity-80"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'var(--color-ink, #12181A)',
                }}
              >
                Advanced legal analysis telemetry. Upload your complex agreements
                and instantly surface anomalies, predatory clauses, and liability
                exposures through our tactical HUD.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                {/* Magnetic Primary CTA */}
                <motion.div
                  ref={magneticRef}
                  style={magneticStyle}
                  className="relative z-20"
                >
                  <HudButton variant="primary" onClick={() => navigate('/register')}>
                    Analyze a contract
                  </HudButton>
                </motion.div>

                {/* Secondary CTA */}
                <a
                  href="#sample"
                  className="group relative text-[11px] uppercase font-bold"
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    color: 'var(--color-ink, #12181A)',
                    letterSpacing: '0.08em',
                  }}
                >
                  See a sample report
                  <span
                    className="absolute -bottom-1 left-0 w-full h-[1px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out"
                    style={{ backgroundColor: 'var(--color-ink, #12181A)' }}
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section
          id="how-it-works"
          className="w-full mt-24 py-32 px-6 relative z-10"
          style={{
            backgroundColor: 'var(--color-ink, #12181A)',
            color: 'var(--color-surface, #F5FBFA)',
          }}
        >
          <div className="max-w-[1440px] mx-auto">
            <div className="scroll-reveal-step mb-16 max-w-2xl">
              <h2
                className="text-[32px] sm:text-[40px] font-bold uppercase tracking-tight"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                Operational Protocol
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: 'Data Ingestion',
                  desc: 'Securely transmit PDF or DOCX payloads into the analysis engine.',
                },
                {
                  title: 'Threat Detection',
                  desc: 'Proprietary ML models scan for non-standard clauses and hidden liabilities.',
                },
                {
                  title: 'Tactical Readout',
                  desc: 'Receive a prioritized HUD detailing exact risk vectors and mitigation steps.',
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="scroll-reveal-step flex flex-col items-start border-t border-[var(--color-surface)] border-opacity-20 pt-6"
                >
                  <Badge
                    tier="neutral"
                    // @ts-ignore - allowing index prop as requested
                    index={`0${i + 1}`}
                    className="mb-6 !bg-[var(--color-surface)] !text-[var(--color-ink)]"
                  >
                    PHASE {i + 1}
                  </Badge>
                  <h3
                    className="text-[20px] font-bold uppercase tracking-tight mb-4"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[14px] opacity-70 leading-relaxed"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="w-full py-32 px-6 max-w-[1440px] mx-auto flex flex-col items-center justify-center text-center">
          <div className="scroll-reveal-cta max-w-2xl flex flex-col items-center">
            <h2
              className="text-[36px] sm:text-[48px] font-bold uppercase tracking-tight mb-6"
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'var(--color-ink, #12181A)',
              }}
            >
              Ready for deployment?
            </h2>
            <p
              className="text-[16px] mb-10 opacity-80"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: 'var(--color-ink, #12181A)',
              }}
            >
              Join the elite teams securing their operations with advanced contract telemetry.
            </p>
            <HudButton variant="primary" onClick={() => navigate('/register')}>REQUEST CLEARANCE</HudButton>
          </div>
        </section>
      </main>

      <Footer
        links={[
          { label: 'Privacy Protocol', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'System Status', href: '/status' },
        ]}
      />
    </div>
  );
};

export default LandingPage;
