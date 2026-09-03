// Persistent, non-dismissible legal/scope notice. Must appear on every page. Do not add a
// close/dismiss control here.
export default function RoEBanner() {
  return (
    <div className="zh-roe-banner">
      This is an official Africahackon practice platform. Authorized testing only, by registered
      Africahackon community members, under the posted{" "}
      <a href="/rules-of-engagement">Rules of Engagement</a>. No real personal data. No attacks
      against hosting infrastructure, denial-of-service, or pivoting to other hosts.
    </div>
  );
}
