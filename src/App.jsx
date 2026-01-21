import { useEffect, useMemo, useState } from "react";
import api from "./utils/api"; // ← 추가!
import AuthScreen from "./screens/AuthScreen.jsx";
import BusinessScreen from "./screens/BusinessScreen.jsx";
import BusinessMainScreen from "./screens/BusinessMainScreen.jsx";
import BusinessMembersScreen from "./screens/BusinessMembersScreen.jsx";
import BusinessMyScreen from "./screens/BusinessMyScreen.jsx";
import BusinessPolicyScreen from "./screens/BusinessPolicyScreen.jsx";
import BusinessTermsScreen from "./screens/BusinessTermsScreen.jsx";
import CustomerScreen from "./screens/CustomerScreen.jsx";
import CustomerMainScreen from "./screens/CustomerMainScreen.jsx";
import CustomerMyScreen from "./screens/CustomerMyScreen.jsx";
import CustomerRefundScreen from "./screens/CustomerRefundScreen.jsx";
import CustomerBankruptcyScreen from "./screens/CustomerBankruptcyScreen.jsx";
import CustomerBankruptcyConfirmScreen from "./screens/CustomerBankruptcyConfirmScreen.jsx";
import CustomerTermsScreen from "./screens/CustomerTermsScreen.jsx";
import CustomerTicketsScreen from "./screens/CustomerTicketsScreen.jsx";
import CustomerAddPassScreen from "./screens/CustomerAddPassScreen.jsx";
import LandingScreen from "./screens/LandingScreen.jsx";
import RoleScreen from "./screens/RoleScreen.jsx";
import OcrResultScreen from "./screens/OcrResultScreen.jsx";
import SignupComplete from "./screens/SignupComplete.jsx";

const screens = {
  LANDING: "landing",
  AUTH: "auth",
  SIGNUP_COMPLETE: "signup_complete",
  ROLE: "role",
  BUSINESS: "business",
  BUSINESS_MAIN: "business_main",
  BUSINESS_MEMBERS: "business_members",
  BUSINESS_MY: "business_my",
  BUSINESS_POLICY: "business_policy",
  BUSINESS_TERMS: "business_terms",
  CUSTOMER: "customer",
  CUSTOMER_MAIN: "customer_main",
  CUSTOMER_TICKETS: "customer_tickets",
  CUSTOMER_MY: "customer_my",
  CUSTOMER_ADD: "customer_add",
  CUSTOMER_TERMS: "customer_terms",
  CUSTOMER_REFUND: "customer_refund",
  CUSTOMER_BANKRUPTCY: "customer_bankruptcy",
  CUSTOMER_BANKRUPTCY_CONFIRM: "customer_bankruptcy_confirm",
  OCR_RESULT: "ocr_result",
};

export default function App() {
  const [screen, setScreen] = useState(() => {
    const saved = localStorage.getItem("currentScreen");
    if (saved && Object.values(screens).includes(saved)) {
      return saved;
    }
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (token && role === "business") {
      return screens.BUSINESS_MAIN;
    }
    if (token && role === "customer") {
      return screens.CUSTOMER_MAIN;
    }
    return screens.LANDING;
  });
  const [authDocked, setAuthDocked] = useState(() => {
    try {
      const nav = performance.getEntriesByType?.("navigation");
      const isReload = nav && nav[0]?.type === "reload";
      return !(isReload && localStorage.getItem("currentScreen") === screens.AUTH);
    } catch {
      return true;
    }
  });
  const [currentDocId, setCurrentDocId] = useState(null);
  const [signupData, setSignupData] = useState(() => {
    try {
      const saved = localStorage.getItem("signupData");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showHello, setShowHello] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [resumeTicket, setResumeTicket] = useState(null);
  const [resumeExpiresAt, setResumeExpiresAt] = useState(0);
  const [resumeExpanded, setResumeExpanded] = useState(false);
  const [ticketsRefreshKey, setTicketsRefreshKey] = useState(0);
  const [businessTermsPass, setBusinessTermsPass] = useState(null);
  const [businessPasses, setBusinessPasses] = useState([]);

  // 회원가입 함수
  const registerUser = async (role) => {
    try {
      let payload = signupData;
      if (!payload) {
        const saved = localStorage.getItem("signupData");
        payload = saved ? JSON.parse(saved) : null;
      }
      if (!payload) {
        alert("회원가입 정보가 사라졌습니다. 다시 진행해주세요.");
        setScreen(screens.AUTH);
        return;
      }
      if (role === "business") {
        // 사업자는 signupData를 localStorage에 저장하고 추가 정보 입력 화면으로
        localStorage.setItem("signupData", JSON.stringify(payload));
        setSignupData(null);
        setScreen(screens.BUSINESS);
      } else {
        // 고객도 지갑 연결 완료 후에만 가입 처리하도록 이동
        localStorage.setItem("signupData", JSON.stringify(payload));
        setSignupData(null);
        setScreen(screens.CUSTOMER);
      }
        
      } catch (error) {
        console.error("회원가입 에러:", error);
        
        // 에러 메시지 안전하게 추출
        let errorMessage = "회원가입에 실패했습니다.";
        if (error.response?.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else {
            errorMessage = JSON.stringify(error.response.data.detail);
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
        setScreen(screens.AUTH);
      }
  };
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
    }, 2100);

    return () => {
      clearTimeout(subtitleTimer);
      clearTimeout(helloTimer);
      clearTimeout(nextTimer);
    };
  }, [screen]);

  const goCustomerTickets = () => {
    setResumeTicket(null);
    setResumeExpiresAt(0);
    setResumeExpanded(false);
    setTicketsRefreshKey((prev) => prev + 1);
    setScreen(screens.CUSTOMER_TICKETS);
  };

  useEffect(() => {
    localStorage.setItem("currentScreen", screen);
  }, [screen]);

  useEffect(() => {
    if (screen !== screens.AUTH) {
      setAuthDocked(false);
      return;
    }
    let isReload = false;
    try {
      const nav = performance.getEntriesByType?.("navigation");
      isReload = !!(nav && nav[0]?.type === "reload");
    } catch {
      isReload = false;
    }
    if (isReload) {
      setAuthDocked(false);
      const timer = setTimeout(() => setAuthDocked(true), 2200);
      return () => clearTimeout(timer);
    }
    setAuthDocked(true);
  }, [screen]);

  return (
    <div className={`app ${screen === screens.AUTH && authDocked ? "logo-docked" : ""}`}>
      <main className="shell">
        {(screen === screens.LANDING || screen === screens.AUTH) && (
          <div className="logo-wrap" aria-hidden="true">
            <svg className="logo-draw" viewBox="0 0 380 180" role="img" aria-label="Blockpass 로고">
              <g className="logo-strokes">
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0s" }}
                  d="M30 65 L90 35 L150 65 L150 135 L90 165 L30 135 Z"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.3s" }}
                  d="M30 65 L90 95 L150 65 M90 95 L90 165"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.5s" }}
                  d="M150 65 L210 35 L270 65 L270 135 L210 165 L150 135"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.7s" }}
                  d="M150 65 L210 95 L270 65 M210 95 L210 165"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "0.9s" }}
                  d="M270 65 L340 65 L340 85 A 15 15 0 0 0 340 115 L340 135 L270 135"
                />
                <path
                  className="logo-stroke logo-dashed"
                  style={{ "--delay": "1.2s" }}
                  d="M270 65 L270 135"
                />
                <path
                  className="logo-stroke"
                  style={{ "--delay": "1.4s" }}
                  d="M230 105 L245 120 L265 85"
                />
              </g>
              <text
                className="logo-stroke logo-text"
                style={{ "--delay": "1.6s" }}
                x="190"
                y="175"
                textAnchor="middle"
              >
                BLOCKPASS
              </text>
            </svg>
          </div>
        )}
        <section className="stage">
          {screen === screens.LANDING && <LandingScreen />}

          {screen === screens.AUTH && (
            <AuthScreen 
              onBack={() => setScreen(screens.LANDING)}
              onSubmit={(type, data) => {
                if (type === "login") {
                  if (data === "business") {
                    setScreen(screens.BUSINESS_MAIN);
                  } else {
                    setScreen(screens.CUSTOMER_MAIN);
                  }
        } else if (type === "signup") {
          localStorage.setItem("signupData", JSON.stringify(data));
          setSignupData(data);
          setScreen(screens.ROLE);
        }
      }}
    />
  )}

          {screen === screens.ROLE && (
            <RoleScreen
              onBusiness={() => registerUser("business")}
              onCustomer={() => registerUser("customer")}
            />
          )}

          {screen === screens.BUSINESS && (
            <BusinessScreen
              onComplete={() => setScreen(screens.BUSINESS_MAIN)}
              onBack={() => setScreen(screens.ROLE)}
            />
          )}

          {screen === screens.BUSINESS_MAIN && (
            <BusinessMainScreen
              passes={businessPasses}
              onMembers={() => setScreen(screens.BUSINESS_MEMBERS)}
              onMain={() => setScreen(screens.BUSINESS_MAIN)}
              onMy={() => setScreen(screens.BUSINESS_MY)}
              onAddPolicy={() => setScreen(screens.BUSINESS_POLICY)}
              onTerms={(pass) => {
                setBusinessTermsPass(pass);
                setScreen(screens.BUSINESS_TERMS);
              }}
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
                localStorage.setItem("currentScreen", screens.BUSINESS_MAIN);
                setScreen(screens.BUSINESS_MAIN);
              }}
              onCancel={() => setScreen(screens.BUSINESS_MAIN)}
            />
          )}

          {screen === screens.BUSINESS_TERMS && (
            <BusinessTermsScreen
              pass={businessTermsPass}
              onBack={() => setScreen(screens.BUSINESS_MAIN)}
            />
          )}

          {screen === screens.CUSTOMER && (
            <CustomerScreen
              onComplete={() => setScreen(screens.CUSTOMER_MAIN)}
              onBack={() => setScreen(screens.ROLE)}
            />
          )}

          {screen === screens.OCR_RESULT && (
            <OcrResultScreen 
              docId={currentDocId} 
              onNext={() => setScreen(screens.CUSTOMER_MAIN)} 
            />
          )}

          {screen === screens.CUSTOMER_MAIN && (
            <CustomerMainScreen
              onTickets={goCustomerTickets}
              onMain={() => setScreen(screens.CUSTOMER_MAIN)}
              onMy={() => setScreen(screens.CUSTOMER_MY)}
              onAddPass={() => setScreen(screens.CUSTOMER_ADD)}
            />
          )}

          {screen === screens.CUSTOMER_TICKETS && (
            <CustomerTicketsScreen
              onTickets={goCustomerTickets}
              onMain={() => setScreen(screens.CUSTOMER_MAIN)}
              onMy={() => setScreen(screens.CUSTOMER_MY)}
              refreshKey={ticketsRefreshKey}
              resumeTicket={resumeTicket}
              resumeExpiresAt={resumeExpiresAt}
              resumeExpanded={resumeExpanded}
              onResumeConsumed={() => {
                setResumeTicket(null);
                setResumeExpiresAt(0);
                setResumeExpanded(false);
              }}
              onTerms={(ticket, expiresAt, isExpanded) => {
                setResumeTicket(ticket);
                setResumeExpiresAt(expiresAt);
                setResumeExpanded(isExpanded);
                setScreen(screens.CUSTOMER_TERMS);
              }}
              onRefund={(ticket, expiresAt, isExpanded) => {
                setResumeTicket(ticket);
                setResumeExpiresAt(expiresAt);
                setResumeExpanded(isExpanded);
                setScreen(screens.CUSTOMER_REFUND);
              }}
              onBankruptcy={(ticket, expiresAt, isExpanded) => {
                setResumeTicket(ticket);
                setResumeExpiresAt(expiresAt);
                setResumeExpanded(isExpanded);
                setScreen(screens.CUSTOMER_BANKRUPTCY);
              }}
            />
          )}

          {screen === screens.CUSTOMER_MY && (
            <CustomerMyScreen
              onTickets={goCustomerTickets}
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
              onBack={() => setScreen(screens.CUSTOMER_MAIN)}
            />
          )}

          {screen === screens.CUSTOMER_TERMS && (
            <CustomerTermsScreen
              ticket={resumeTicket}
              onBack={() => setScreen(screens.CUSTOMER_TICKETS)}
            />
          )}

          {screen === screens.CUSTOMER_REFUND && (
            <CustomerRefundScreen
              ticket={resumeTicket}
              onBack={() => setScreen(screens.CUSTOMER_TICKETS)}
              onComplete={goCustomerTickets}
            />
          )}
          {screen === screens.CUSTOMER_BANKRUPTCY && (
            <CustomerBankruptcyScreen
              onBack={() => setScreen(screens.CUSTOMER_TICKETS)}
              onNext={() => setScreen(screens.CUSTOMER_BANKRUPTCY_CONFIRM)}
            />
          )}
          {screen === screens.CUSTOMER_BANKRUPTCY_CONFIRM && (
            <CustomerBankruptcyConfirmScreen
              ticket={resumeTicket}
              onBack={() => setScreen(screens.CUSTOMER_BANKRUPTCY)}
              onComplete={goCustomerTickets}
            />
          )}
          {screen === screens.SIGNUP_COMPLETE && (
            <SignupComplete 
              onLogin={() => setScreen(screens.AUTH)}
            />
          )}
        </section>
      </main>
    </div>
  );
}
