import { ApiAuditParametersType, AuditParametersType } from "../auditparameters/types";
import { ApiPageType } from "../pages/types";
import { ApiScriptType } from "../scripts/types";


export interface ProjectType {
  uuid: string;
  name: string;
  pagesIds: string[];
  scriptsIds: string[];
  screenshotUrl: string;
  latestAuditAt: string;
  auditParametersList: AuditParametersType[];
}

export type StatusType = "SUCCESS" | "REQUESTED" | "PENDING" | "ERROR";

export interface AuditStatusHistoryType {
  createdAt: string;
  status: StatusType;
  details: string;
  auditParametersId: string;
}

export interface ApiAuditStatusHistoryType {
  created_at: string;
  status: StatusType;
  details: string;
  parameters: string;
}

export interface ApiProjectType {
  uuid: string;
  name: string;
  pages: ApiPageType[];
  scripts: ApiScriptType[];
  audit_parameters_list: ApiAuditParametersType[];
  screenshot_url: string;
  latest_audit_at: string;
}
