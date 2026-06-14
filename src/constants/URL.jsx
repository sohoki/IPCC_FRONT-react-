const URL = {
    MAIN: "/backoffice", //메인페이지

    REFRESH_TOKEN: "/uat/uia/actionRefreshToken.do",
    LOGIN_PROCESS: "/uat/uia/actionLoginJWT.do",
    LOGOUT_PROCESS: "/uat/uia/actionLogout.do",
    ID_FIND_PROCESS: "/uat/uia/actionIdFind.do",
    PWD_FIND_PROCESS: "/uat/uia/actionPwdFind.do",
    MANAGER_DETAIL_PWD: "/api/backoffice/hrm/manager/pwd",
    //사용자 메뉴 
    LEFT_MENU: "/api/backoffice/sys/menu/menuNoLeft.do",

    CODE_LIST: "/backoffice/basic/codelist", //코드목록
    CODEID_LIST: "/api/backoffice/sys/cmm/cca/code/codeList.do",
    CODE_LIST_COMBO: "/api/backoffice/sys/cmm/cca/code/codeCombo",
    CODE_INFO : "/api/backoffice/sys/cmm/cca",
    CODE_LIST_SUB_LIST:"/api/backoffice/sys/cmm/cde/detailList.do",
    CODE_PROCESS_UPDATE:"/api/backoffice/sys/cmm/cca/code/codeUpdate.do",
    CODE_PROCESS_UPDATE_USEYN:"/api/backoffice/sys/cmm/cca/code/codeUseYnUpdate.do",

    CODE_LIST_COMBO_CDE: "/api/backoffice/sys/cmm/cde/combo",
    CODE_ID_CHECK: "/api/backoffice/sys/cmm/cca/codeIDCheck",
    CODE_DETAIL_UPDATE: "/api/backoffice/sys/cmm/cde/CodeDetailUpdate.do",
    CODE_DETAIL_UPDATE_USEYN: "/api/backoffice/sys/cmm/cde/CodeDetailUpdateYn.do",
    CODE_DETAIL_INFO: "/api/backoffice/sys/cmm/cde",

    PROGRAM_LIST: "/api/backoffice/sys/prog/programList.do",
    PROGRAME_PROCESS: "/api/backoffice/sys/prog/updateProgrmInfo.do",
    PROGRAME_MODIFY: "/equick/common/programModify",
    PROGRAME_CREATE: "/equick/common/programCreate",
    PROGRAM_INFO: "/api/backoffice/sys/prog",
    PROGRAM_ID_CHECK: "/api/backoffice/sys/prog/programIDCheck",


    MENU_LIST : "/api/backoffice/sys/menu/menuListAjax.do",
    MENU_SAVE:"/api/backoffice/sys/menu/menuRegistUpdate.do",
    MENU_ID_CHECK: "/api/backoffice/sys/menu/menuCheck",
    MENU_DELETE:"/api/backoffice/sys/menu",
    MENU_CREATE_UPDATE:"/api/backoffice/sys/menu/menuCreateUpdateAjax.do", // 권한별 메뉴 생성

    //권한 정보 
    ROLE_ID_CHECK:"/api/backoffice/uat/role/idCheck",
    ROLE_UPDATE:"/api/backoffice/uat/role/roleUpdate.do",
    //신규
    ROLE_USEYN_UPDATE: "/api/backoffice/uat/role/roleUseynUpdate.do",
    ROLE_DELETE:"/api/backoffice/uat/role",
    ROLE_LIST : "/api/backoffice/uat/role/roleList.do",
    ROLE_MENU : "/api/backoffice/sys/menu/roleMenu",
    ROLE_COMBO: "/api/backoffice/uat/role/roleCombo.do",


    // 연동 SYSTEM 관리 정보
    SYSTEM_LIST: "/api/backoffice/sys/system/systemList.do",
    SYSTEM_USEYN_UPDATE: "/api/backoffice/sys/system/useyn",

    SYSTEM_ID_CHECK: "/api/backoffice/sys/system/systemIDCheck",
    SYSTEM_INFO: "/api/backoffice/sys/system",
    SYSTEM_UPDATE: "/api/backoffice/sys/system/systemInfo.do",

    //기관 관리
    INSTT_LIST: "/api/backoffice/sys/cmm/icr/List.do",
    INSTT_ID_CHECK: "/api/backoffice/sys/cmm/icr/codeCheck",
    INSTT_INFO: "/api/backoffice/sys/cmm/icr",
    INSTT_INTERFACE : "/api/interface/integration/InsttBatch.do",
    INSTT_UPDATE: "/api/backoffice/sys/cmm/icr/updateInstt.do",
    //기관 인프라 관리
    INSTT_INFRA_UPDATE: "/api/backoffice/sys/cmm/icr/instttenantId.do",
    INSTT_COMBO: "/api/backoffice/sys/cmm/icr/insttComboboxCode.do",

    INSTT_INFRA_LIST: "/api/backoffice/uat/uia/partinfra/partInfraList.do",
    INSTT_CALL_INFRA_UPDATE: "/api/backoffice/uat/uia/partinfra/update.do",
    INSTT_CALL_INFRA_INFO: "/api/backoffice/uat/uia/partinfra",
    // 지점 관리
    CENTER_LIST: "/api/backoffice/infra/bld/cnt/centerList.do",
    CENTER_DETAIL: "/api/backoffice/infra/bld/cnt/detail",
    CENTER_UPDATE: "/api/backoffice/infra/bld/cnt/centerUpdate.do",
    CENTER_DELETE: "/api/backoffice/infra/cnt",
    CENTER_STATE: "/api/backoffice/infra/bld/cnt/state",
    CENTER_COMBO: "/api/backoffice/infra/bld/cnt/centerCombo.do",
    // 층 관리
    FLOOR_LIST: "/api/backoffice/infra/bld/floor/floorList.do",
    FLOOR_DETAIL: "/api/backoffice/infra/bld/floor/detail",
    FLOOR_COMBO: "/api/backoffice/infra/bld/floor/combo",
    FLOOR_UPDATE: "/api/backoffice/infra/bld/floor/floorUpdate.do",
    FLOOR_SEAT_UPDATE: "/api/backoffice/infra/bld/floor/floorSeatUpdate.do",
    FLOOR_DELETE: "/api/backoffice/infra/bld/floor",
    // 구역 관리 파트
    BLD_PART_LIST: "/api/backoffice/infra/bld/part/partList.do",
    BLD_PART_DETAIL: "/api/backoffice/infra/bld/part/detail",
    BLD_PART_COMBO: "/api/backoffice/infra/bld/part/combo",
    BLD_PART_UPDATE: "/api/backoffice/infra/bld/part/partUpdate.do",
    BLD_PART_GUI_UPDATE: "/api/backoffice/infra/bld/part/partGuiUpdate.do",
    BLD_PART_DELETE: "/api/backoffice/infra/bld/part",
    // 구역 관리
    PARTCLASS_LIST: "/api/backoffice/infra/bld/partclass/partClassList.do",
    PARTCLASS_DETAIL: "/api/backoffice/infra/bld/partclass/detail",
    PARTCLASS_COMBO: "/api/backoffice/infra/bld/partclass/combo",
    PARTCLASS_UPDATE: "/api/backoffice/infra/bld/partclass/partClassUpdate.do",
    PARTCLASS_DELETE: "/api/backoffice/infra/bld/partclass",
    // 시즌 관리
    SEASON_LIST: "/api/backoffice/infra/bld/season/seasonList.do",
    SEASON_DETAIL: "/api/backoffice/infra/bld/season/detail",
    SEASON_CENTER_LIST: "/api/backoffice/infra/bld/season/centerList",
    SEASON_SEAT_LIST: "/api/backoffice/infra/bld/season/seasonSeatList.do",
    SEASON_GUI_UPDATE: "/api/backoffice/infra/bld/season/seasonGuiUpdate.do",
    SEASON_UPDATE: "/api/backoffice/infra/bld/season/seasonInfoUpdate.do",
    SEASON_DELETE: "/api/backoffice/infra/bld/season",
    // 좌석 관리
    SEAT_LIST: "/api/backoffice/infra/bld/seat/seatList.do",
    SEAT_DETAIL: "/api/backoffice/infra/bld/seat/detail",
    SEAT_UPDATE: "/api/backoffice/infra/bld/seat/seatInfoUpdate.do",
    SEAT_GUI_UPDATE: "/api/backoffice/infra/bld/seat/seatGuiUpdate.do",
    SEAT_EXCEL_UPLOAD: "/api/backoffice/infra/bld/seat/seatExcelUpload.do",
    SEAT_DELETE: "/api/backoffice/infra/bld/seat",
    // 시스템 AMQP 연동
    QUEUE_COMBO_LIST: "/api/backoffice/sys/message/amqp/queueComboList.do",
    SYSTEM_AMQP_LIST: "/api/backoffice/sys/message/amqp/systemAmqpList.do",
    SYSTEM_AMQP_DELETE: "/api/backoffice/sys/message/amqp/delete.do",
    SYSTEM_AMQP_UPDATE: "/api/backoffice/sys/message/amqp/asmpUpdateS.do",
    // 메세지 QUEUE 관리
    QUEUE_LIST: "/api/backoffice/sys/message/amqp/queueList.do",
    QUEUE_ID_CHECK: "/api/backoffice/sys/message/amqp/existsQueues",
    QUEUE_CREATE: "/api/backoffice/sys/message/amqp/createQueues.do",
    QUEUE_DELETE: "/api/backoffice/sys/message/amqp/deleteQueues.do",
    // 장애관리 (VOC)
    VOC_LIST: "/api/backoffice/sym/voc/voclist.do",
    VOC_INFO: "/api/backoffice/sym/voc",
    VOC_UPDATE: "/api/backoffice/sym/voc/reqVoc.do",
    VOC_HISTORY: "/api/backoffice/sym/voc/vocHistory",
    VOC_PROCESS_LIST: "/api/backoffice/sym/voc/vocProcesslist.do",
    VOC_PROCESS_INFO: "/api/backoffice/sym/voc/vocProcess",
    VOC_PROCESS_UPDATE: "/api/backoffice/sym/voc/VocResUpdate.do",
    VOC_ADMIN_COMBO: "/api/backoffice/uat/uia/manager/adminCombo.do",
    // 장애알림 메세지 관리
    ALERT_LIST: "/api/backoffice/sym/alt/alerList.do",
    ALERT_INFO: "/api/backoffice/sym/alt",
    ALERT_UPDATE: "/api/backoffice/sym/alt/messageUpdate.do",
    ALERT_PART_LIST: "/api/backoffice/sym/alt/alertPartList.do",
    ALERT_PART: "/api/backoffice/sym/alt/part",
    ALERT_PART_UPDATE: "/api/backoffice/sym/alt/messagePartUpdate.do",
    ALERT_REC_LIST: "/api/backoffice/sym/alt/recList.do",
    ALERT_REC: "/api/backoffice/sym/alt/rec",
    ALERT_REC_UPDATE: "/api/backoffice/sym/alt/messageRecUpdate.do",
    // 서버 현황
    SERVICE_INFO_LIST: "/api/backoffice/sym/svr/service/list.do",
    SERVICE_INFO: "/api/backoffice/sym/svr/service",
    SERVICE_INFO_UPDATE: "/api/backoffice/sym/svr/updateService.do",
    SERVICE_OID_LIST: "/api/backoffice/sym/svr/oid/list.do",
    SERVICE_OID: "/api/backoffice/sym/svr/oid",
    SERVICE_OID_UPDATE: "/api/backoffice/sym/svr/updateServiceOid.do",
    SERVICE_OID_VIEW: "/api/backoffice/sym/svr/oidView",
    SERVICE_SERVER_COMBO: "/api/backoffice/sym/svr/serverCombo.do",
    //서버 현황
    SERVER_INFO_LIST: "/api/backoffice/sym/svr/list.do",
    SERVER_INFO: "/api/backoffice/sym/svr",
    SERVER_INFO_UPDATE: "/api/backoffice/sym/svr/updateServer.do",
    SERVER_STATUS_CHECK: "/api/backoffice/sym/svr/check",
    SERVER_SYSTEM_COMBO: "/api/backoffice/sys/system/systemCombo.do",
    SERVER_COMPANY_COMBO: "/api/backoffice/infra/cor/com/companyCombo.do",
    // IP 내선관리
    IP_LIST: "/api/backoffice/uat/uia/ipconfig/ipList.do",
    IP_INFO: "/api/backoffice/uat/uia/ipconfig",
    IP_UPDATE: "/api/backoffice/uat/uia/ipconfig/ipccIpUpdate.do",
    // SMS 모델 관리
    SMS_MODEL_LIST: "/api/backoffice/sys/pbx/avaya/list.do",
    SMS_MODEL_INFO: "/api/backoffice/sys/pbx/avaya",
    SMS_MODEL_UPDATE: "/api/backoffice/sys/pbx/avaya/updateSmsInfo.do",
    SMS_MODEL_AVAYA_QUERY: "/api/backoffice/sys/pbx/avaya/avayaQuery",
    // CTI 로그 관리
    CTI_LOGIN_ID_LIST: "/api/interface/int/nex/dn/loginIdList.do",
    CTI_LOGIN_ID_UPDATE: "/api/interface/int/nex/dn/loginIdUpdate.do",
    CTI_LOGIN_ID_DELETE: "/api/interface/int/nex/dn/loginIdDelete.do",
    CTI_LOGIN_ID_CHECK: "/api/interface/int/nex/dn/loginIdCheck.do",
    // CTI 사용자 관리(Tenant / Group / Part)
    CTI_TENANT_LIST: "/api/interface/int/nex/org/tenantList.do",
    CTI_TENANT_UPDATE: "/api/interface/int/nex/org/updateTenantInfo.do",
    CTI_TENANT_DELETE: "/api/interface/int/nex/dn/loginIdDelete.do",
    CTI_TENANT_ID_CHECK: "/api/interface/int/nex/org/tenantCheck.do",
    CTI_GROUP_LIST: "/api/interface/int/nex/org/ctiGroupList.do",
    CTI_GROUP_UPDATE: "/api/interface/int/nex/org/updateGroupInfo.do",
    CTI_GROUP_DELETE: "/api/interface/int/nex/org/deleteGroupInfo.do",
    CTI_GROUP_ID_CHECK: "/api/interface/int/nex/org/groupCheck.do",
    CTI_PART_LIST: "/api/interface/int/nex/org/ctiTeamList.do",
    CTI_PART_UPDATE: "/api/interface/int/nex/org/updateTeamsInfo.do",
    CTI_PART_DELETE: "/api/interface/int/nex/org/deleteTeamInfo.do",
    CTI_PART_ID_CHECK: "/api/interface/int/nex/org/teamCheck.do",
    // CTI DN 관리
    CTI_DN_LIST: "/api/interface/int/nex/dn/dnList.do",
    CTI_DN_UPDATE: "/api/interface/int/nex/dn/dnUpdate.do",
    CTI_DN_DELETE: "/api/interface/int/nex/dn/dnDelete.do",
    CTI_DN_ID_CHECK: "/api/interface/int/nex/dn/dnCheck.do",
    CTI_CENTER_COMBO: "/api/interface/int/nex/emp/centerCombo.do",
    CTI_TENANT_COMBO: "/api/interface/int/nex/emp/tenantCombo",
    CTI_DN_MAJOR_COMBO: "/api/interface/int/nex/dn/dnMajorCombo.do",
    CTI_DN_SUB_COMBO: "/api/interface/int/nex/dn/dnSubCombo.do",
    CTI_MEDIA_COMBO: "/api/interface/int/nex/dn/mediaCombo.do",
    // IVR 정보 관리
    IVR_LIST: "/api/interface/int/diotis/List.do",
    IVR_INFO: "/api/interface/int/diotis",
    IVR_UPDATE: "/api/interface/int/diotis/ivrUpdate.do",
    IVR_CALLBACK_UPDATE: "/api/interface/int/diotis/ivrCallbackUpdate.do",
    IVR_SEND: "/api/interface/int/diotis/file",
    IVR_WORK_LIST: "/api/interface/int/diotis/work/List.do",
    IVR_WORK_UPDATE: "/api/interface/int/diotis/updateIvrWorktime.do",
    IVR_WORK_DELETE: "/api/interface/int/diotis/worktime",
    IVR_HOLY_LIST: "/api/interface/int/diotis/holy/List.do",
    IVR_HOLY_UPDATE: "/api/interface/int/diotis/updateIvrHoly.do",
    IVR_HOLY_DELETE: "/api/interface/int/diotis/holy",
    IVR_INSTT_COMBO: "/api/backoffice/sys/cmm/cde/comboEtc",
    // 에이전트 관리
    AGENT_LIST: "/api/backoffice/ipcc/avaya/pbx/agent/list.do",
    AGENT_INFO: "/api/backoffice/ipcc/avaya/pbx/agent",
    AGENT_UPDATE: "/api/backoffice/ipcc/avaya/pbx/agent/update.do",
    AGENT_ID_CHECK: "/api/backoffice/ipcc/avaya/pbx/agent/check",
    AGENT_RANDOM: "/api/backoffice/ipcc/avaya/pbx/agent/random",
    AGENT_LIST_UPDATE: "/api/backoffice/ipcc/avaya/pbx/agent/updateAgentList.do",
    AGENT_EXCEL_UPDATE: "/api/backoffice/ipcc/avaya/pbx/agent/excelUpdate.do",
    AGENT_PBX_SEARCH: "/api/backoffice/sys/sms/SmsTrank/notiSeq.do",
    // 인증 체크
    AUTH_CHECK: "/jwtAuthAPI",
    // 관리자 관리
    MANAGER_DETAIL: "/api/backoffice/uat/uia/manager",
    MANAGER_UPDATE: "/api/backoffice/uat/uia/manager/managerUpdate.do",
    MANAGER_STATE_CHANGE: "/api/backoffice/uat/uia/manager/StateChange",
    MANAGER_ID_CHECK: "/api/backoffice/uat/uia/manager/idCheck",
    // 관리자 권한
    MANAGER_USEYN: "/api/backoffice/uat/uia/manager/useyn",
    MANAGER_PASS_CHANGE: "/api/backoffice/uat/uia/manager/passChange.do",

    CONSULTANT_COMBO: "/api/backoffice/uat/uia/contant/selectConsultantAdminCombo.do",
    PART_COMBO: "/api/backoffice/uat/uia/part/partCombo.do",
    // 부서 관리
    PART_LIST: "/api/backoffice/uat/uia/part/partList.do",
    PART_UPDATE: "/api/backoffice/uat/uia/part/partUpdate.do",
    PART_DELETE: "/api/backoffice/uat/uia/part",

    PART_SYNC: "/api/interface/integration/PartBatch.do",
    PART_PARENT_COMBO: "/api/backoffice/uat/uia/part/parentPartCombo.do",
    PART_AGENT_CHECK: "/api/backoffice/uat/uia/partinfra/agentCheck.do",
    // 직원 관리 공통
    EMP_LIST: "/api/backoffice/uat/uia/manager/empList.do",
    CTI_GROUP_COMBO: "/api/interface/int/nex/emp/groupInfoCombo.do",
    CTI_TEAM_COMBO: "/api/interface/int/nex/emp/teamsCombo.do",
    CTI_EMP_COMBO: "/api/interface/int/nex/emp/employeeCombo.do",
    CTI_PERMIT_COMBO: "/api/interface/int/nex/emp/Permit.do",
    // 상담사 관리
    CONSULTANT_LIST: "/api/backoffice/uat/uia/contant/consultantList.do",
    CONSULTANT_DETAIL: "/api/backoffice/uat/uia/contant/consultant",
    CONSULTANT_UPDATE: "/api/backoffice/uat/uia/contant/update.do",
    CONSULTANT_DELETE: "/api/backoffice/uat/uia/contant",
    CONSULTANT_RETIRE: "/api/backoffice/uat/uia/contant/consultant/withdrow",
    CONSULTANT_EXCEL_UPDATE: "/api/backoffice/uat/uia/contant/ctiExcelUpdate.do",
    // SKILL 관리
    SKILL_LIST: "/api/interface/int/nex/skillList.do",
    SKILL_UPDATE: "/api/interface/int/nex/skillUpdate.do",
    SKILL_DELETE: "/api/interface/int/nex/skillDelete.do",
    SKILL_CHECK: "/api/interface/int/nex/skillCheck.do",
    SKILL_EMP_LIST: "/api/interface/int/nex/skillEmployeesList.do",
    SKILL_EMP_UPDATE: "/api/interface/int/nex/skillEmployeesUpdate.do",
    SKILL_EMP_DELETE: "/api/interface/int/nex/skillEmployeesDelete.do",
}
export default URL;
