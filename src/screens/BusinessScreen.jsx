// C:\Project\kaist\2_week\blockpass-front\src\screens\BusinessScreen.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import BackButton from "./BackButton.jsx";
import api from "../utils/api";

const steps = [
  {
    title: "사업장 이름을 알려주세요",
    button: "다음",
  },
  {
    title: "사업자등록번호를 알려주세요",
    button: "다음",
  },
  {
    title: "사업장 위치를 알려주세요",
    button: "다음",
  },
  {
    title: "사업장 대표 가상자산 지갑을 등록해주세요",
    button: "완료",
  },
];

export default function BusinessScreen({
  onComplete,
  onBack,
}) {
  useEffect(() => {
    console.info("[BusinessScreen] build marker: 2026-01-19T06:05Z");
  }, []);
  const { address: accountAddress, isConnecting, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [userName, setUserName] = useState(() => {
    try {
      const signupDataStr = localStorage.getItem('signupData');
      if (signupDataStr) {
        const signupData = JSON.parse(signupDataStr);
        if (signupData?.name) {
          return signupData.name;
        }
      }
    } catch {
      // ignore parse errors and fall back to stored name
    }
    return localStorage.getItem('user_name') || "";
  });
  const [searchResults, setSearchResults] = useState([]);
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const hasHydrated = useRef(false);

  const isIntro = stepIndex === -1 && !saveComplete;
  const isComplete = saveComplete;
  const isForm = stepIndex >= 0 && stepIndex < steps.length && !saveComplete;
  const stepLabel = useMemo(() => `${stepIndex + 1}/4`, [stepIndex]);
  const progressPercent = useMemo(
    () => ((stepIndex + 1) / 4) * 100,
    [stepIndex]
  );

  const isStepValid = useMemo(() => {
    if (stepIndex === -1) {  // 인트로 화면은 항상 통과
      return true;
    }
    if (stepIndex === 0) {
      return businessName.trim().length > 0;
    }
    if (stepIndex === 1) {
      return registrationNumber.trim().length > 0;
    }
    if (stepIndex === 2) {
      return storeAddress.length > 0;
    }
    if (stepIndex === 3) {
      return walletAddress.trim().length > 0;
    }
    return false;
  }, [stepIndex, businessName, registrationNumber, storeAddress, walletAddress]);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await api.get('/auth/me');
          setUserName(response.data.name);
          return;
        }

        const signupDataStr = localStorage.getItem('signupData');
        if (signupDataStr) {
          const signupData = JSON.parse(signupDataStr);
          setUserName(signupData.name || "");
          return;
        }

        const storedName = localStorage.getItem('user_name');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
        setError("사용자 정보를 불러올 수 없습니다.");
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
          setUserName(storedName);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  // 화면 상태 복구 (앱 전환 후 리로드 대비)
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    const saved = localStorage.getItem("businessFlowState");
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (typeof state.stepIndex === "number") setStepIndex(state.stepIndex);
      if (state.businessName) setBusinessName(state.businessName);
      if (state.registrationNumber) setRegistrationNumber(state.registrationNumber);
      if (state.locationQuery) setLocationQuery(state.locationQuery);
      if (state.storeAddress) setStoreAddress(state.storeAddress);
      if (typeof state.lat === "number") setLat(state.lat);
      if (typeof state.lng === "number") setLng(state.lng);
      if (state.walletAddress) setWalletAddress(state.walletAddress);
    } catch (e) {
      console.warn("restore businessFlowState failed", e);
    }
  }, []);

  // 화면 상태 저장
  useEffect(() => {
    const snapshot = {
      stepIndex,
      businessName,
      registrationNumber,
      locationQuery,
      storeAddress,
      lat,
      lng,
      walletAddress,
    };
    localStorage.setItem("businessFlowState", JSON.stringify(snapshot));
  }, [stepIndex, businessName, registrationNumber, locationQuery, storeAddress, lat, lng, walletAddress]);

  // 카카오맵 초기화 (3단계에서만)
  // 카카오맵 초기화 (3단계에서만)
useEffect(() => {
  if (stepIndex !== 2) return;

  const initMap = () => {
    const container = document.getElementById('map');
    if (!container) return;

    // 카카오맵 로드 확인
    if (!window.kakao || !window.kakao.maps) {
      setTimeout(initMap, 100); // 100ms 후 재시도
      return;
    }

    const options = {
      center: new window.kakao.maps.LatLng(36.366, 127.344),
      level: 3
    };
    
    mapRef.current = new window.kakao.maps.Map(container, options);
  };

  initMap();
}, [stepIndex]);

  // 주소 검색
  const handleSearchPlace = () => {
  if (!locationQuery.trim()) {
    alert("검색어를 입력해주세요.");
    return;
  }

  if (!window.kakao || !window.kakao.maps) {
    alert("지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  const ps = new window.kakao.maps.services.Places();
  
  ps.keywordSearch(locationQuery, (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      setSearchResults(data.slice(0, 10)); // 상위 10개만
    } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
      alert("검색 결과가 없습니다.");
      setSearchResults([]);
    } else {
      alert("검색 중 오류가 발생했습니다.");
      setSearchResults([]);
    }
  });
};

const handleSelectPlace = (place) => {
  const coords = new window.kakao.maps.LatLng(place.y, place.x);
  
  if (!mapRef.current) return;
  
  mapRef.current.setCenter(coords);
  
  if (markerRef.current) {
    markerRef.current.setMap(null);
  }
  
  markerRef.current = new window.kakao.maps.Marker({
    map: mapRef.current,
    position: coords
  });
  
  setStoreAddress(place.address_name);
  setLat(parseFloat(place.y));
  setLng(parseFloat(place.x));
  setSearchResults([]);
  setLocationQuery(place.place_name);
};

  const handleNext = () => {
    if (!isStepValid) {
      return;
    }
    if (stepIndex === steps.length - 1) {
      handleComplete();
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    console.log("handleBack 호출, stepIndex:", stepIndex, "onBack:", onBack);
    
    // 인트로 화면(-1)에서 뒤로가기
    if (stepIndex === -1) {
      if (onBack && typeof onBack === "function") {
        onBack();
      }
      return;
    }
    
    // 첫 번째 단계(0)에서 뒤로가기 → 인트로로
    if (stepIndex === 0) {
      setStepIndex(-1);
      return;
    }

    // 그 외 단계에서 뒤로가기
    setStepIndex((prev) => prev - 1);
  };
  const handleWalletConnect = async () => {
    setWalletError("");
    try {
      // 혹시 이전 세션이 꼬여 있으면 먼저 정리 후 다시 시도
      if (status === "connecting" || status === "reconnecting") {
        await disconnect();
      }
      await open();
    } catch (error) {
      console.error("지갑 연결 에러:", error);
      setWalletError("지갑 연결에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // wagmi 계정 상태를 화면 상태에 반영
  useEffect(() => {
    if (accountAddress) {
      setWalletAddress(accountAddress);
      setWalletError("");
    }
  }, [accountAddress]);

  const handleComplete = async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      // localStorage에서 signupData 확인
      const signupDataStr = localStorage.getItem('signupData');
      
      if (signupDataStr) {
        // signupData가 있으면 회원가입 처리
        const signupData = JSON.parse(signupDataStr);
        
        try {
          await api.post('/auth/register', {
            email: signupData.email,
            password: signupData.password,
            name: signupData.name,
            role: 'business'
          });
          
          // 회원가입 후 자동 로그인
          const formBody = new URLSearchParams();
          formBody.append('username', signupData.email);
          formBody.append('password', signupData.password);
          
          const loginResponse = await api.post('/auth/login', formBody, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          // 토큰 저장
          localStorage.setItem('access_token', loginResponse.data.access_token);
          localStorage.setItem('user_role', 'business');
          localStorage.setItem('user_name', signupData.name);
          
        } catch (registerError) {
          console.error("회원가입 에러:", registerError);
          // 이미 가입된 경우 로그인 시도
          if (registerError.response?.status === 400) {
            const formBody = new URLSearchParams();
            formBody.append('username', signupData.email);
            formBody.append('password', signupData.password);
            
            const loginResponse = await api.post('/auth/login', formBody, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
            
            localStorage.setItem('access_token', loginResponse.data.access_token);
            localStorage.setItem('user_role', 'business');
            localStorage.setItem('user_name', signupData.name);
          } else {
            throw registerError;
          }
        }
        
        // signupData 삭제
        localStorage.removeItem('signupData');
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
      }
      
      // 프로필 업데이트
      await api.patch('/auth/profile', {
        business_name: businessName,
        registration_number: registrationNumber,
        wallet_address: walletAddress,
        address: storeAddress,
        lat: lat,
        lng: lng
      });
      localStorage.removeItem("businessFlowState");

      setSaveComplete(true);
      setTimeout(() => {
        if (typeof onComplete === "function") {
          onComplete();
        }
      }, 1200);
    } catch (error) {
      console.error("사업자 정보 저장 실패:", error);
      
      // 상세 에러 메시지 표시
      let errorMessage = "정보 저장에 실패했습니다.";
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      
      alert(errorMessage + " 다시 시도해주세요.");
      setIsSaving(false);
    }
  };

  return (
    <div className="flow-screen business-flow" key="business">
      {!isComplete && <BackButton onBack={handleBack} />}
      {isIntro && (
        <>
          <div className="greeting-block">
            <h2 className="greeting-title">{userName ? `${userName} 사장님` : "사장님"}</h2>
            <p className="greeting-sub">
              사업장 정보를 등록하기 위해 필요한 몇 가지 질문 답변해주세요.
            </p>
          </div>
          <button className="next-button cta-static" type="button" onClick={handleNext}>
            다음
          </button>
        </>
      )}

      {isForm && (
        <>
          <div className="progress-wrap">
            <div className="progress-track">
              <span
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="step-indicator">{stepLabel}</div>
          </div>

          <div className="form-block">
            <h2 className="form-title">{steps[stepIndex].title}</h2>
            {stepIndex === 0 && (
              <input
                className="input-field"
                type="text"
                placeholder="예: 블록패스 피트니스"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            )}
            {stepIndex === 1 && (
              <input
                className="input-field"
                type="text"
                placeholder="예: 123-45-67890"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
              />
            )}
            {stepIndex === 2 && (
            <>
              <div style={{ display: 'flex', gap: '8px', width: 'min(360px, 100%)', position: 'relative' }}>
                <input
                  className="input-field"
                  type="text"
                  placeholder="주소 또는 장소를 검색해주세요"
                  value={locationQuery}
                  onChange={(event) => {
                    setLocationQuery(event.target.value);
                    if (!event.target.value.trim()) {
                      setSearchResults([]);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchPlace()}
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={handleSearchPlace}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#0f6f73',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  검색
                </button>
              </div>
              
              {/* 검색 결과 리스트 */}
              {searchResults.length > 0 && (
                <div style={{
                  width: 'min(360px, 100%)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  marginTop: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {searchResults.map((place, idx) => (
                    <div
                      key={place.id || idx}
                      onClick={() => handleSelectPlace(place)}
                      style={{
                        padding: '16px',
                        borderBottom: idx < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '15px',
                          color: '#111827',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {place.place_name}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#6b7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {place.address_name}
                        </div>
                        {place.category_name && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#9ca3af',
                            marginTop: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {place.category_name.split('>').pop().trim()}
                          </div>
                        )}
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  ))}
                </div>
              )}
              
              {storeAddress && !searchResults.length && (
                <div style={{ 
                  fontSize: '14px', 
                  color: '#0f6f73', 
                  marginTop: '8px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f6f73" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {storeAddress}
                </div>
              )}
              
              <div 
                id="map" 
                style={{ 
                  width: 'min(360px, 100%)', 
                  height: '300px',
                  borderRadius: '16px',
                  marginTop: '12px',
                  border: '1px solid rgba(15, 111, 115, 0.2)',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              />
            </>
          )}
            {stepIndex === 3 && (
              <>
                <button
                  className="wallet-button"
                  type="button"
                  onClick={handleWalletConnect}
                >
                  메타마스크 연결하기
                </button>
                {walletAddress && (
                  <div className="wallet-address">
                    {walletAddress.slice(0, 6)}...
                    {walletAddress.slice(-4)}
                  </div>
                )}
                {walletError && <div className="wallet-error">{walletError}</div>}
              </>
            )}
          </div>

          <button
            className="next-button cta-static"
            type="button"
            disabled={!isStepValid || isSaving}
            onClick={handleNext}
          >
            {isSaving ? "저장 중..." : steps[stepIndex].button}
          </button>
        </>
      )}

      {isComplete && (
        <div className="complete-block no-back">
          <h2 className="complete-title">등록이 완료되었어요.</h2>
        </div>
      )}
    </div>
  );
}
