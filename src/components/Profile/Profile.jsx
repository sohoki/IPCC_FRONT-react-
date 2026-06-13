import { Card, Button, Image } from 'react-bootstrap';
import { PlusCircle, BoxArrowRight, HouseDoor, X } from 'react-bootstrap-icons';
import URL from "@/constants/URL.jsx";

const Profile = ({
    managerInfo, 
    onLogout, 
    onClose,
    onEditProfile 
}) => {

    const {
        managerName = '관리자',
        managerEmail = '',
        managerPic = null,
    } = managerInfo || {};


    const handleProfileClick = () => {
        onClose();   // 프로필 카드 닫기
        onEditProfile(); 
    }

    return (
        <Card 
            className="text-white p-3 border-0" 
            style={{ width: '360px', backgroundColor: '#202124', borderRadius: '24px' }}
            >
            {/* 상단 헤더 (이메일 및 닫기 버튼) */}
            <div className="d-flex justify-content-between align-items-center mb-4 ps-5">
                <span style={{ fontSize: '14px', color: '#e8eaed', flexGrow: 1, textAlign: 'center' }}>
                {managerEmail}
                </span>
                <Button variant="link" className="text-white p-0 m-0 border-0 align-self-start" onClick={onClose}>
                    <X size={24} />
                </Button>
            </div>

            {/* 프로필 이미지 섹션 (그라데이션 테두리) */}
            <div className="d-flex flex-column align-items-center mb-3">
                <div 
                className="d-flex justify-content-center align-items-center position-relative mb-2"
                style={{
                    width: '85px',
                    height: '85px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                    padding: '4px'
                }}
                >
                <div 
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#007a78',
                        borderRadius: '50%',
                        fontSize: '28px'
                    }}
                >
                    {managerPic ? (
                        <Image 
                            src={`${URL.IMG_URL}${managerPic}`}
                            roundedCircle
                            alt={managerName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                // 데이터는 있지만 이미지 경로가 깨졌을 때(404 등) 글자 UI로 대체하는 예외 처리
                                e.target.style.display = 'none'; // ?��?지 ?�기�?
                                e.target.parentNode.innerText = (managerName || '?�름').substring(0, 2); // 부모 div에 글자 주입
                            }}
                        />
                    ):(
                        <span>{managerName.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                {/* 카메라 아이콘 버튼 */}
                <Button 
                    variant="dark" 
                    onClick={handleProfileClick} // 실행할 함수 연결
                    className="position-absolute bottom-0 end-0 rounded-circle p-1 d-flex align-items-center justify-content-center border border-secondary"
                    style={{ width: '26px', height: '26px', backgroundColor: '#202124' }}
                >
                    <span style={{ fontSize: '10px' }}>📷</span>
                </Button>
                </div>

                <h5 className="mb-3" style={{ fontSize: '20px', color: '#e8eaed' }}>
                안녕하세요, {managerName}님.
                </h5>

                <Button 
                variant="outline-light" 
                className="rounded-pill px-4 py-1"
                style={{ fontSize: '14px', borderColor: '#5f6368', color: '#8ab4f8' }}
                onClick={handleProfileClick}
                >
                정보수정
                </Button>
            </div>

            
             {/* 하단 버튼 섹션 (계정 추가 / 로그아웃) */}
            <div className="d-flex gap-2">
                <Button 
                variant="dark" 
                className="w-100 py-3 d-flex align-items-center justify-content-center gap-2 border-0"
                style={{ backgroundColor: '#2d2f31', borderRadius: '0 0 16px 0', fontSize: '14px' }}
                onClick={onLogout}
                >
                <BoxArrowRight size={16} /> 로그아웃
                </Button>
            </div>
        </Card>
    );
};

export default Profile;
