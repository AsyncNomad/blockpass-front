import { useEffect, useMemo, useState } from "react";
import AuthScreen from "./screens/AuthScreen.jsx";
import BusinessScreen from "./screens/BusinessScreen.jsx";
import BusinessMainScreen from "./screens/BusinessMainScreen.jsx";
import BusinessMembersScreen from "./screens/BusinessMembersScreen.jsx";
import BusinessMyScreen from "./screens/BusinessMyScreen.jsx";
import BusinessPolicyScreen from "./screens/BusinessPolicyScreen.jsx";
import CustomerScreen from "./screens/CustomerScreen.jsx";
import CustomerMainScreen from "./screens/CustomerMainScreen.jsx";
import CustomerMyScreen from "./screens/CustomerMyScreen.jsx";
import CustomerTicketsScreen from "./screens/CustomerTicketsScreen.jsx";
import CustomerAddPassScreen from "./screens/CustomerAddPassScreen.jsx";
import LandingScreen from "./screens/LandingScreen.jsx";
import RoleScreen from "./screens/RoleScreen.jsx";

const screens = {
  LANDING: "landing",
  AUTH: "auth",
  ROLE: "role",
  BUSINESS: "business",
  BUSINESS_MAIN: "business_main",
  BUSINESS_MEMBERS: "business_members",
  BUSINESS_MY: "business_my",
  BUSINESS_POLICY: "business_policy",
  CUSTOMER: "customer",
  CUSTOMER_MAIN: "customer_main",
  CUSTOMER_TICKETS: "customer_tickets",
  CUSTOMER_MY: "customer_my",
  CUSTOMER_ADD: "customer_add",
};

export default function App() {
  const [screen, setScreen] = useState(screens.LANDING);
  const [showHello, setShowHello] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [businessPasses, setBusinessPasses] = useState([
    { title: "블록핏 헬스장 1개월권", price: "150,000원" },
    { title: "블록핏 헬스장 3개월권", price: "390,000원" },
    { title: "블록핏 헬스장 PT 10회권", price: "500,000원" },
  ]);

  const screenTitle = useMemo(() => {
    if (screen === screens.ROLE) {
      return "역할 선택";
    }
    return "안전한 이용권 결제";
  }, [screen]);

  useEffect(() => {
    if (screen !== screens.LANDING) {
      return undefined;
    }

    setShowHello(false);
    setShowSubtitle(false);
    const subtitleTimer = setTimeout(() => {
      setShowSubtitle(true);
    }, 1900);
    const helloTimer = setTimeout(() => {
      setShowHello(true);
    }, 1300);
    const nextTimer = setTimeout(() => {
      setScreen(screens.AUTH);
    }, 3200);

    return () => {
      clearTimeout(subtitleTimer);
      clearTimeout(helloTimer);
      clearTimeout(nextTimer);
    };
  }, [screen]);

  return (
    <div className={`app ${screen === screens.AUTH ? "logo-docked" : ""}`}>
      <main className="shell">
        {(screen === screens.LANDING || screen === screens.AUTH) && (
          <div className="logo-wrap" aria-hidden="true">
            <svg
              className="logo-draw"
              viewBox="0 0 360 220"
              role="img"
              aria-label="Blockpass 로고"
            >
              <g className="logo-strokes">
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0s" }}
                  d="M30 88 90 48 150 88 90 128z"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.08s" }}
                  d="M90 48v80"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.16s" }}
                  d="M150 88v80"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.24s" }}
                  d="M30 88v80l60 40 60-40"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.32s" }}
                  d="M150 88 210 48 270 88 210 128z"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.4s" }}
                  d="M210 48v80"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.48s" }}
                  d="M270 88v80"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.56s" }}
                  d="M150 88v80l60 40 60-40"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.64s" }}
                  d="M270 70h40a22 22 0 0 1 22 22v44a22 22 0 0 1-22 22h-40"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.72s" }}
                  d="M270 92h18m-18 18h18m-18 18h18"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.8s" }}
                  d="M220 122l16 16 26-28"
                />
              </g>
              <text
                className="logo-stroke logo-text"
                style={{ "--delay": "0.95s" }}
                x="180"
                y="205"
                textAnchor="middle"
              >
                BLOCKPASS
              </text>
            </svg>
          </div>
        )}
        <section className="stage">
          {screen === screens.LANDING && (
            <LandingScreen />
          )}

          {screen === screens.AUTH && (
            <AuthScreen onSubmit={() => setScreen(screens.ROLE)} />
          )}

          {screen === screens.ROLE && (
            <RoleScreen
              onBusiness={() => setScreen(screens.BUSINESS)}
              onCustomer={() => setScreen(screens.CUSTOMER)}
            />
          )}

          {screen === screens.BUSINESS && (
            <BusinessScreen onComplete={() => setScreen(screens.BUSINESS_MAIN)} />
          )}

          {screen === screens.BUSINESS_MAIN && (
            <BusinessMainScreen
              passes={businessPasses}
              onMembers={() => setScreen(screens.BUSINESS_MEMBERS)}
              onMain={() => setScreen(screens.BUSINESS_MAIN)}
              onMy={() => setScreen(screens.BUSINESS_MY)}
              onAddPolicy={() => setScreen(screens.BUSINESS_POLICY)}
            />
          )}

          {screen === screens.BUSINESS_MEMBERS && (
            <BusinessMembersScreen
              onMembers={() => setScreen(screens.BUSINESS_MEMBERS)}
              onMain={() => setScreen(screens.BUSINESS_MAIN)}
              onMy={() => setScreen(screens.BUSINESS_MY)}
            />
          )}

          {screen === screens.BUSINESS_MY && (
            <BusinessMyScreen
              onMembers={() => setScreen(screens.BUSINESS_MEMBERS)}
              onMain={() => setScreen(screens.BUSINESS_MAIN)}
              onMy={() => setScreen(screens.BUSINESS_MY)}
              onLogout={() => setScreen(screens.LANDING)}
            />
          )}

          {screen === screens.BUSINESS_POLICY && (
            <BusinessPolicyScreen
              onSave={(newPass) => {
                setBusinessPasses((prev) => [newPass, ...prev]);
                setScreen(screens.BUSINESS_MAIN);
              }}
              onCancel={() => setScreen(screens.BUSINESS_MAIN)}
            />
          )}

          {screen === screens.CUSTOMER && (
            <CustomerScreen onComplete={() => setScreen(screens.CUSTOMER_MAIN)} />
          )}

          {screen === screens.CUSTOMER_MAIN && (
            <CustomerMainScreen
              onTickets={() => setScreen(screens.CUSTOMER_TICKETS)}
              onMain={() => setScreen(screens.CUSTOMER_MAIN)}
              onMy={() => setScreen(screens.CUSTOMER_MY)}
              onAddPass={() => setScreen(screens.CUSTOMER_ADD)}
            />
          )}

          {screen === screens.CUSTOMER_TICKETS && (
            <CustomerTicketsScreen
              onTickets={() => setScreen(screens.CUSTOMER_TICKETS)}
              onMain={() => setScreen(screens.CUSTOMER_MAIN)}
              onMy={() => setScreen(screens.CUSTOMER_MY)}
            />
          )}

          {screen === screens.CUSTOMER_MY && (
            <CustomerMyScreen
              onTickets={() => setScreen(screens.CUSTOMER_TICKETS)}
              onMain={() => setScreen(screens.CUSTOMER_MAIN)}
              onMy={() => setScreen(screens.CUSTOMER_MY)}
              onLogout={() => setScreen(screens.LANDING)}
            />
          )}

          {screen === screens.CUSTOMER_ADD && (
            <CustomerAddPassScreen
              onTickets={() => setScreen(screens.CUSTOMER_TICKETS)}
              onMain={() => setScreen(screens.CUSTOMER_MAIN)}
              onMy={() => setScreen(screens.CUSTOMER_MY)}
              onComplete={() => setScreen(screens.CUSTOMER_TICKETS)}
            />
          )}
        </section>
      </main>
    </div>
  );
}
