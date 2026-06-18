import React, {Suspense, lazy} from "react";
import { Routes, Route, Navigate  } from "react-router-dom";
import ScrollToTop from "@/components/utils/ScrollToTop.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute.jsx";
import AppLayout from "@/layouts/AppLayout.jsx";
import AppTopDownLayout from "@/layouts/AppTopDownLayout.jsx";
import PageLoading from "@/components/Common/PageLoading.jsx";

const ErrorPage = lazy(() => import('@/pages/Common/ErrorPage.jsx'));
const NotFound = lazy(() => import('@/pages/Common/NotFound.jsx'));
const Login = lazy(() => import('@/pages/Auth/Login.jsx'));
const FindPage = lazy(() => import('@/pages/Find/FindPage.jsx'));
const InsttInfo = lazy(() => import('@/pages/Backoffice/System/InsttInfo.jsx'));
const ProgrameInfo  = lazy(() => import('@/pages/Backoffice/Basic/ProgrameInfo.jsx'));
const MenuInfo = lazy(() => import('@/pages/Backoffice/Basic/MenuInfo.jsx'));
const RoleInfo = lazy(() => import('@/pages/Backoffice/Basic/RoleInfo.jsx'));
const CodeInfo = lazy(() => import('@/pages/Backoffice/Basic/CodeInfo.jsx'));

const SystemInfo = lazy(() => import('@/pages/Backoffice/System/SystemInfo.jsx'));
const QueueInfo = lazy(() => import('@/pages/Backoffice/System/QueueInfo.jsx'));

const PartInfo = lazy(() => import('@/pages/Backoffice/HrInfo/PartInfo.jsx'));
const ManagerInfo = lazy(() => import('@/pages/Backoffice/HrInfo/ManagerInfo.jsx'));

const ServerInfo = lazy(() => import('@/pages/Backoffice/Infra/Equipment/ServerInfo.jsx'));
const SystemServiceInfo = lazy(() => import('@/pages/Backoffice/Infra/Equipment/SystemServiceInfo.jsx'));

// 시설 관리(BLD) — 층/구역등급/시즌/좌석
const FloorInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/FloorInfo.jsx'));
const PartClassInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/PartClassInfo.jsx'));
const SeasonInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/SeasonInfo.jsx'));
const SeatInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/SeatInfo.jsx'));
//거래처 관리
const VendorInfo = lazy(() => import('@/pages/Backoffice/Vendor/VendorInfo.jsx'));
const VenderDetailInfo = lazy(() => import('@/pages/Backoffice/Vendor/VendorDetailInfo.jsx'));
//infra 관리 넣기
const PbxInfo = lazy(() => import('@/pages/Backoffice/Infra/call/pbx/PbxInfo.jsx'));
const PbxAgentInfo = lazy(() => import('@/pages/Backoffice/Infra/call/pbx/PbxAgentInfo.jsx'));
const PbxSmsModelInfo = lazy(() => import('@/pages/Backoffice/Infra/call/pbx/PbxSmsModelInfo.jsx'));
const IvrConfigInfo = lazy(() => import('@/pages/Backoffice/Infra/call/ivr/IvrConfigInfo.jsx'));
const BuildInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/BuildInfo.jsx'));

//상담사 관리
const AlertMessageInfo = lazy(() => import('@/pages/Backoffice/Manager/Message/AlertMessageInfo.jsx'));
const ConstantInfo = lazy(() => import('@/pages/Backoffice/Manager/CallCenter/ConstantInfo.jsx'));
const ConstantSkillStatus = lazy(() => import('@/pages/Backoffice/Manager/CallCenter/ConstantSkillStatus.jsx'));





export default function RouterConfig() {
    return (
        <>
            <ScrollToTop />
            <Suspense fallback={<PageLoading />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    {/* 인증이 필요한 라우트 */}
                    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        {/* 여기에 인증이 필요한 라우트를 추가 */}
                        <Route path="/sub/bas/basInstt" element={<InsttInfo />} />
                        <Route path="/sub/bas/programeInfo" element={<ProgrameInfo />} />
                        
                        <Route path="/sub/bas/menuInfo" element={<MenuInfo />} />
                        <Route path="/sub/bas/roleInfo" element={<RoleInfo />} />
                        <Route path="/sub/bas/codeInfo" element={<CodeInfo />} />

                        { /* system menu */}
                        <Route path="/sub/sym/systemInfo" element={<SystemInfo />} />
                        <Route path="/sub/sym/queueInfo" element={<QueueInfo />} />
                        
                        { /* hr menu */}
                        <Route path="/sub/hr/partInfo" element={<PartInfo />} />
                        <Route path="/sub/hr/managerInfo" element={<ManagerInfo />} />
                        { /* infra menu */}
                        <Route path="/sub/infra/serverInfo" element={<ServerInfo />} />
                        <Route path="/sub/infra/systemServiceInfo" element={<SystemServiceInfo />} />
                        { /* 시설 관리(BLD) */}

                        <Route path="/sub/bld/buildInfo" element={<BuildInfo />} />
                        <Route path="/sub/bld/floorInfo" element={<FloorInfo />} />
                        <Route path="/sub/bld/partClassInfo" element={<PartClassInfo />} />
                        <Route path="/sub/bld/seasonInfo" element={<SeasonInfo />} />
                        <Route path="/sub/bld/seatInfo" element={<SeatInfo />} />

                        { /* 거래처 관리 */}
                        <Route path="/sub/client/venderInfo" element={<VendorInfo />} />
                        <Route path="/sub/client/detail/:comCode" element={<VenderDetailInfo />} />

                        { /* infra 리스트*/}
                        <Route path="/sub/infra/call/ivrinfo" element={<IvrConfigInfo />} />
                        <Route path="/sub/manager/msg/alertMsgInfo" element={<AlertMessageInfo />} />

                    </Route>   
                    {/* 인증이 필요 없는 라우트 */}
                    <Route element={<AppTopDownLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/search/:type" element={<FindPage />} />
                        <Route path="/404" element={<ErrorPage statusCode="404" message="페이지를 찾을 수 없습니다." />} />
                        <Route path="/500" element={<ErrorPage statusCode="500" message="서버 오류가 발생했습니다." />} />
                        <Route path="/error" element={<ErrorPage statusCode="오류" message="서버와 통신 중 오류가 발생했습니다." />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </Suspense>
        </>
    );
};