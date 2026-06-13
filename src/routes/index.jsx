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
const MessageInfo = lazy(() => import('@/pages/Backoffice/System/MessageInfo.jsx'));

const PartInfo = lazy(() => import('@/pages/Backoffice/HrInfo/PartInfo.jsx'));
const ManagerInfo = lazy(() => import('@/pages/Backoffice/HrInfo/ManagerInfo.jsx'));

const ServerInfo = lazy(() => import('@/pages/Backoffice/Infra/Equipment/ServerInfo.jsx'));
const SystemServiceInfo = lazy(() => import('@/pages/Backoffice/Infra/Equipment/SystemServiceInfo.jsx'));

// 시설 관리(BLD) — 층/구역등급/시즌/좌석
const FloorInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/FloorInfo.jsx'));
const PartClassInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/PartClassInfo.jsx'));
const SeasonInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/SeasonInfo.jsx'));
const SeatInfo = lazy(() => import('@/pages/Backoffice/Infra/bld/SeatInfo.jsx'));

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

                        <Route path="/sub/sym/messageInfo" element={<MessageInfo />} />
                        { /* hr menu */}
                        <Route path="/sub/hr/partInfo" element={<PartInfo />} />
                        <Route path="/sub/hr/managerInfo" element={<ManagerInfo />} />
                        { /* infra menu */}
                        <Route path="/sub/infra/serverInfo" element={<ServerInfo />} />
                        <Route path="/sub/infra/systemServiceInfo" element={<SystemServiceInfo />} />
                        { /* 시설 관리(BLD) */}
                        <Route path="/sub/bld/floorInfo" element={<FloorInfo />} />
                        <Route path="/sub/bld/partClassInfo" element={<PartClassInfo />} />
                        <Route path="/sub/bld/seasonInfo" element={<SeasonInfo />} />
                        <Route path="/sub/bld/seatInfo" element={<SeatInfo />} />
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