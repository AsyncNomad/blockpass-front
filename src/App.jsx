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
        // 고객은 바로 회원가입 처리 후 지갑 등록 단계로 이동
        await api.post('/auth/register', {
          email: payload.email,
          password: payload.password,
          name: payload.name,
          role: role
        });

        const formBody = new URLSearchParams();
        formBody.append('username', payload.email);
        formBody.append('password', payload.password);

        const loginResponse = await api.post('/auth/login', formBody, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        localStorage.setItem('access_token', loginResponse.data.access_token);
        localStorage.setItem('user_role', 'customer');
        localStorage.setItem('user_name', payload.name);
        
        setSignupData(null);
        localStorage.removeItem("signupData");
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
    setScreen(screens.CUSTOMER_TICKETS);
  };

  useEffect(() => {
    localStorage.setItem("currentScreen", screen);
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
