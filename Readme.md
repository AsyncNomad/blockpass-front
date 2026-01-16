# 1. 문제 정의

## 운동만 열심히 하고 싶은데, 헬스장이 사라질까 봐 걱정부터 해야 해요.

헬스장, 독서실, 학원처럼 이용권을 판매하는 사업체에서는 고객이 먼저 비용을 지불하고, 서비스는 나중에 제공됩니다. 대부분의 이용권에는 환불 규정이 명시되어 있습니다.

하지만 이용권을 구매한 뒤 얼마 지나지 않아 사업체가 파산하거나 폐업한다면, 그 환불 규정은 더 이상 의미가 없어집니다.

- 연락할 수 있는 담당자는 없고
- 환불을 처리할 주체도 사라지며
- 남은 이용권은 그대로 손실이 됩니다

이용자는 계약을 맺었지만,

정작 계약이 **실행될 수 없는 상황**에 놓이게 됩니다.

---

## 문제는 특정 주체의 ‘양심’에 의존하는 구조에 있어요.

기존 이용권 환불 구조에서는

환불이 시스템으로 보장되지 않습니다.

- 사장님이 끝까지 책임지기를 기대하고
- 회사가 파산하지 않기를 바라며
- 문제가 생기지 않기를 운에 맡깁니다

환불 규정은 분명 존재하지만,

이를 **반드시 지켜야 할 기술적 장치**는 없습니다.

그래서 같은 문제가 반복됩니다.

- 폐업 직전까지 이용권 판매
- 환불 약속은 문서에만 남음
- 피해는 항상 이용자에게 돌아감

이건 개인의 부주의 문제가 아니라,

**환불을 강제할 수 없는 구조적인 문제**입니다.

---

# 2. BlockPass의 새로운 접근법

BlockPass는 이 문제를 ‘사람을 믿는 방식’이 아니라 블록체인을 통해 **시스템으로 보장하는 방식**으로 해결합니다.

---

## 계약서를 블록체인에 기록해요.

BlockPass에서는 이용권 계약과 환불 규정을 블록체인에 기록합니다.

- 계약이 언제, 어떤 조건으로 체결됐는지
- 환불 규정이 어떻게 설정되어 있는지

이 정보는 블록체인에 저장되어 누구도 임의로 수정하거나 삭제할 수 없습니다. 계약은 더 이상 서버나 회사 내부 문서에만 존재하지 않습니다.

---

## 환불 규정의 준수를 특정 주체의 ‘양심’에 맡기지 않아요.

환불 규정은 사람이 판단하고 처리하지 않습니다. BlockPass에서는 환불 조건이 **스마트 컨트랙트**로 만들어집니다.

- 헬스장 사장님은 ‘이용 기간의 몇 % 이전에는 몇 % 환불’과 같은 규칙을 직접 설정하고
- 이 규칙은 코드로 변환되어 블록체인에 배포됩니다

한 번 배포된 스마트 컨트랙트는

- 헬스장 사장님도
- BlockPass 회사도
- 그 누구도 임의로 수정할 수 없습니다

조건이 충족되면, 환불은 **반드시 자동으로 실행**됩니다.

---

## 누가 사라져도 계약은 실행돼요.

헬스장이 폐업하거나, 심지어 우리 BlockPass가 서비스를 중단하더라도 스마트 컨트랙트는 블록체인 위에 그대로 남아 작동합니다.

- 사업자가 없어져도
- 운영 주체가 바뀌어도

환불 조건이 만족되면 이용자는 설정된 규정에 따라 환불을 받게 됩니다. 환불은 더 이상 요청이나 협의의 대상이 아닙니다. **이미 정해진 결과**입니다.

---

# 3. 기술 스택

## 아키텍처 다이어그램
```mermaid
graph TD
    %% 스타일 정의
    classDef front fill:#E1F5FE,stroke:#01579B,stroke-width:2px,color:black;
    classDef back fill:#E8F5E9,stroke:#1B5E20,stroke-width:2px,color:black;
    classDef chain fill:#FFF3E0,stroke:#E65100,stroke-width:2px,color:black;

    %% 노드 정의
    subgraph Client [Client Side]
        FE(<b>Frontend</b><br/>Vite + React<br/>--<br/>사용자 UI / 정책 입력)
    end

    subgraph Server [Server Side]
        BE(<b>Backend</b><br/>FastAPI<br/>--<br/>Solidity 코드 변환 & 컴파일)
    end

    subgraph Infra [Infrastructure]
        BC(<b>Blockchain</b><br/>Ethereum / EVM<br/>--<br/>Smart Contract 배포)
    end

    %% 연결선
    FE <--"<b>REST API (JSON)</b><br/>환불 정책 & 계약 데이터"--> BE
    BE --"<b>Web3.py / RPC</b><br/>트랜잭션 배포 & 서명"--> BC

    %% 스타일 적용
    class FE front;
    class BE back;
    class BC chain;
```

## 구체적인 시퀀스 다이어그램

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자 (Client)
    participant FE as Frontend (Vite+React)
    participant BE as Backend (FastAPI)
    participant Compiler as Solidity Compiler (solc)
    participant Chain as Blockchain Network

    Note over User, FE: 1. 환불 정책 설정 및 계약 생성
    User->>FE: 환불 정책 입력 (예: 7일 이내 100% 환불)
    FE->>BE: 정책 데이터 전송 (JSON)

    Note over BE, Compiler: 2. 정책 → 솔리디티 변환 (핵심)
    BE->>BE: 정책 데이터를 Solidity 템플릿에 주입
    BE->>Compiler: 완성된 .sol 코드 컴파일 요청
    Compiler-->>BE: Bytecode & ABI 반환

    Note over BE, Chain: 3. 체인 배포 (자동화)
    BE->>BE: 관리자 지갑으로 트랜잭션 생성 및 서명
    BE->>Chain: 스마트 컨트랙트 배포 (Deploy Transaction)
    Chain-->>BE: 컨트랙트 주소 (Contract Address) 반환
    BE-->>FE: 배포 완료 및 주소 응답

    Note over User, FE: 4. 사용자 계약 체결
    User->>FE: 생성된 계약서 확인 및 서명(동의)
    FE->>BE: 사용자 서명 데이터 전송

    Note over BE, Chain: 5. 계약 내용 온체인 기록
    BE->>Chain: setContractAgrement(User, Hash) 호출
    Chain-->>BE: 트랜잭션 해시 (Tx Hash)
    BE-->>FE: 계약 체결 완료
```