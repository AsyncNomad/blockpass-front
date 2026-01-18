// C:\Project\kaist\2_week\blockpass-front\src\screens\BusinessScreen.jsx
import { useEffect, useMemo, useState, useRef } from "react";
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

export default function BusinessScreen({ onComplete, onBack }) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [userName, setUserName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const isIntro = stepIndex === -1;
  const isComplete = stepIndex === steps.length;
  const isForm = stepIndex >= 0 && stepIndex < steps.length;
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
      return address.length > 0;
    }
    if (stepIndex === 3) {
      return walletAddress.trim().length > 0;
    }
    return false;
  }, [stepIndex, businessName, registrationNumber, address, walletAddress]);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/auth/me');
        setUserName(response.data.name);
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
          setUserName(storedName);
        }
      }
    };
    fetchUserInfo();
  }, []);

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
  const handleSearchAddress = () => {
    if (!locationQuery.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    
    geocoder.addressSearch(locationQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        
        mapRef.current.setCenter(coords);
        
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        
        markerRef.current = new window.kakao.maps.Marker({
          map: mapRef.current,
          position: coords
        });
        
        setAddress(result[0].address_name);
        setLat(parseFloat(result[0].y));
        setLng(parseFloat(result[0].x));
        
        alert(`주소가 확인되었습니다: ${result[0].address_name}`);
      } else {
        alert("주소를 찾을 수 없습니다. 다시 입력해주세요.");
      }
    });
  };

  const handleNext = () => {
    if (!isStepValid) {
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setStepIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      if (prev === 0) {
        return -1;
      }
      return prev;
    });
    if (stepIndex <= -1 && onBack) {
      onBack();
    }
  };

  const handleWalletConnect = async () => {
    setWalletError("");
    if (!window.ethereum) {
      setWalletError("메타마스크를 설치해주세요.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts?.[0] || "");
    } catch (error) {
      setWalletError("지갑 연결에 실패했어요. 다시 시도해주세요.");
    }
  };

  const handleComplete = async () => {
  try {
    // 먼저 회원가입 처리
    const signupData = JSON.parse(localStorage.getItem('signupData'));
    if (signupData) {
      await api.post('/auth/register', {
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        role: 'business'
      });
    }
    
    // 그 다음 프로필 업데이트
    await api.patch('/auth/profile', {
      business_name: businessName,
      registration_number: registrationNumber,
      wallet_address: walletAddress,
      address: address,
      lat: lat,
      lng: lng
    });
    
    // signupData 삭제
    localStorage.removeItem('signupData');
    
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1200);
  } catch (error) {
    console.error("사업자 정보 저장 실패:", error);
    alert("정보 저장에 실패했습니다. 다시 시도해주세요.");
  }
};

  useEffect(() => {
    if (!isComplete) {
      return;
    }
    handleComplete();
  }, [isComplete]);

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
                <div style={{ display: 'flex', gap: '8px', width: 'min(360px, 100%)' }}>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="주소 또는 장소를 검색해주세요"
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                    style={{ flex: 1 }}
                  />
                  <button 
                    onClick={handleSearchAddress}
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
                {address && (
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#0f6f73', 
                    marginTop: '8px',
                    fontWeight: '600'
                  }}>
                    ✓ {address}
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
            disabled={!isStepValid}
            onClick={handleNext}
          >
            {steps[stepIndex].button}
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