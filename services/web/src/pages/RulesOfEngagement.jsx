import Layout from "../components/Layout";

export default function RulesOfEngagement() {
  return (
    <Layout>
      <section className="zh-container" style={{ padding: "56px 24px", maxWidth: 820 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
          <img src="/africahackon-logo.png" alt="Africahackon" style={{ height: 56 }} />
        </div>

        <h1>Rules of Engagement</h1>
        <p>
          Zenith HR is an official Africahackon practice platform. It is a wholly fictional
          company created for authorized security-testing practice. It is not a real HR or
          payroll vendor, and it contains no real employee, customer, or company data. Every
          record is synthetic and generated with a faker library.
        </p>

        <h2>Who may test</h2>
        <p>
          Testing is permitted only for registered members of the Africahackon community who
          hold an account on this platform, for the duration of the program under which it is
          made available.
        </p>

        <h2>What is in scope</h2>
        <p>
          The Zenith HR web application and API at this domain, and only this application. Any
          vulnerability class you can genuinely trigger against Zenith HR's own functionality,
          including its data, sessions, and file storage, is in scope for practice.
        </p>

        <h2>What is out of scope</h2>
        <ul>
          <li>The underlying hosting infrastructure, cloud provider, or network itself.</li>
          <li>Any form of denial-of-service or availability-impacting testing.</li>
          <li>Uploading, submitting, or otherwise introducing real personal data of any kind.</li>
          <li>Pivoting from this environment to any other host, service, or network.</li>
          <li>Attacking or scraping other testers' accounts or sessions.</li>
        </ul>

        <h2>Reporting &amp; contact</h2>
        <p>
          For questions about scope, to report an environment issue, or to coordinate with
          program operators, contact{" "}
          <a href="mailto:security@africahackon.example">security@africahackon.example</a>.
        </p>

        <h2>Logging</h2>
        <p>
          Authentication attempts and administrative actions on this platform are recorded to an
          append-only audit log for program operators to review.
        </p>
      </section>
    </Layout>
  );
}
