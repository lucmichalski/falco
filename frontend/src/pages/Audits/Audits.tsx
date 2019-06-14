import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { ValueType } from 'react-select/lib/types';
import { AuditParametersType, ProjectType } from 'redux/projects/types';

import Badge from 'components/Badge';
import ErrorMessage from 'components/ErrorMessage';
import Loader from 'components/Loader';
import Select from 'components/Select';
import { FormattedMessage, InjectedIntlProps } from 'react-intl';
import { PageType, ScriptType } from 'redux/projects/types';
import { routeDefinitions } from 'routes';
import { colorUsage, getSpacing } from 'stylesheet';
import AnalyticsBlock from './AnalyticsBlock';
import { Container, PageTitle, PageTitleBlock, ScriptStepBlock, ScriptStepBlockTitle, Title } from './Audits.style';
import GraphsBlock from './GraphsBlock';

interface ScriptStepOption {
  value: string;
  label: string;
}

export type OwnProps = {} & RouteComponentProps<{
  projectId: string;
  pageOrScriptId: string;
  auditParametersId: string;
  scriptStepId?: string;
}>;

type Props = {
  project?: ProjectType;
  page?: PageType;
  script?: ScriptType;
  auditParameters: Record<string, AuditParametersType>;
  scriptSteps: Record<string, string>;
  sortedPageAuditResultsIds: string[] | null;
  sortedScriptAuditResultsIds: Record<string, string[]> | null;
  fetchProjectRequest: (projectId: string) => void;
  fetchAuditResultsRequest: (
    auditParametersId: string,
    pageOrScriptId: string,
    type: 'page' | 'script',
  ) => void;
  setCurrentAuditParametersId: (auditParametersId: string | null | undefined) => void;
  setCurrentPageId: (pageId: string | null | undefined) => void;
  setCurrentScriptId: (scriptId: string | null | undefined) => void;
  setCurrentScriptStepId: (scriptStepId: string | null | undefined) => void;
} & OwnProps &
  InjectedIntlProps;

export const Audits: React.FunctionComponent<Props> = ({
  auditParameters,
  fetchProjectRequest,
  history,
  intl,
  match,
  project,
  page,
  script,
  scriptSteps,
  sortedPageAuditResultsIds,
  sortedScriptAuditResultsIds,
  fetchAuditResultsRequest,
  setCurrentAuditParametersId,
  setCurrentPageId,
  setCurrentScriptId,
  setCurrentScriptStepId,
}) => {
  const { projectId, pageOrScriptId, auditParametersId, scriptStepId } = match.params;

  React.useEffect(
    () => {
      fetchProjectRequest(projectId);
    },
    [projectId],
  );

  React.useEffect(
    () => {
      if (page) {
        setCurrentPageId(pageOrScriptId ? pageOrScriptId : undefined);
        setCurrentScriptId(undefined);
        fetchAuditResultsRequest(auditParametersId, pageOrScriptId, 'page');
      } else if (script) {
        setCurrentPageId(undefined);
        setCurrentScriptId(pageOrScriptId ? pageOrScriptId : undefined);
        fetchAuditResultsRequest(auditParametersId, pageOrScriptId, 'script');
      }
    },
    [auditParametersId, pageOrScriptId, page && page.uuid, script && script.uuid],
  );

  React.useEffect(
    () => {
      setCurrentAuditParametersId(auditParametersId);
    },
    [auditParametersId],
  );

  React.useEffect(
    () => {
      setCurrentScriptStepId(script && scriptStepId ? scriptStepId : undefined);
    },
    [script && script.uuid, scriptStepId],
  );

  if (project === undefined) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  if (project === null) {
    return (
      <Container>
        <ErrorMessage>
          <FormattedMessage id="Project.project_error" />
        </ErrorMessage>
      </Container>
    );
  }

  if (
    (!project.pages || 0 === project.pages.length) &&
    (!project.scripts || 0 === project.scripts.length)
  ) {
    return (
      <Container>
        <ErrorMessage>
          <FormattedMessage id="Project.no_page_or_script_error" />
        </ErrorMessage>
      </Container>
    );
  }

  if (!page && !script) {
    return (
      <Container>
        <ErrorMessage>
          <FormattedMessage id="Audits.page_or_script_unavailable" />
        </ErrorMessage>
      </Container>
    );
  }

  if (0 === project.auditParametersList.length) {
    return (
      <Container>
        <ErrorMessage>
          <FormattedMessage id="Project.no_audit_parameters_error" />
        </ErrorMessage>
      </Container>
    );
  }

  if (!auditParameters[auditParametersId]) {
    return (
      <Container>
        <ErrorMessage>
          <FormattedMessage id="Audits.audit_parameters_unavailable" />
        </ErrorMessage>
      </Container>
    );
  }

  if (
    script &&
    sortedScriptAuditResultsIds &&
    0 !== Object.keys(sortedScriptAuditResultsIds).length &&
    !scriptStepId
  ) {
    return (
      <Redirect
        to={routeDefinitions.auditsScriptDetails.path
          .replace(':projectId', projectId)
          .replace(':pageOrScriptId', pageOrScriptId)
          .replace(':auditParametersId', auditParametersId)
          .replace(':scriptStepId', Object.keys(sortedScriptAuditResultsIds)[0])}
      />
    );
  }

  const getBadgeParams = () => {
    if (page) {
      return {
        backgroundColor: colorUsage.pageBadgeBackground,
        color: colorUsage.pageBadgeText,
        text: intl.formatMessage({ id: `Menu.page_badge` }),
      };
    } else if (script) {
      return {
        backgroundColor: colorUsage.scriptBadgeBackground,
        color: colorUsage.scriptBadgeText,
        text: intl.formatMessage({ id: `Menu.script_badge` }),
      };
    }
    return {
      backgroundColor: '',
      color: '',
      text: '',
    };
  };

  const pageOrScriptName = page ? page.name : script ? script.name : '';

  const badgeParams = getBadgeParams();

  const sortedAuditResultsIds = page
    ? sortedPageAuditResultsIds
    : script && sortedScriptAuditResultsIds
      ? scriptStepId && sortedScriptAuditResultsIds[scriptStepId]
        ? sortedScriptAuditResultsIds[scriptStepId]
        : []
      : null;

  const scriptStepSelectOptions = Object.keys(scriptSteps)
    .map(scriptStepKey => ({
      value: scriptStepKey,
      label: scriptStepKey || 0 + ' : ' + scriptSteps[scriptStepKey] || "Unknown step",
    }));

  const handleScriptStepSelection = (selectedOption: ValueType<ScriptStepOption | {}>) => {
    // Check needed to avoid TS2339 error
    if (selectedOption && 'value' in selectedOption) {
      history.push(
        routeDefinitions.auditsScriptDetails.path
          .replace(':projectId', projectId)
          .replace(':pageOrScriptId', pageOrScriptId)
          .replace(':auditParametersId', auditParametersId)
          .replace(':scriptStepId', selectedOption.value),
      );
    }
  };

  return (
    <Container>
      <PageTitleBlock>
        <PageTitle>{project.name + ' / ' + pageOrScriptName}</PageTitle>
        {(page || script) && (
          <Badge
            backgroundColor={badgeParams.backgroundColor}
            color={badgeParams.color}
            margin={`0 0 0 ${getSpacing(4)}`}
            text={badgeParams.text}
          />
        )}
      </PageTitleBlock>
      <Title><FormattedMessage id="Audits.title" /></Title>
      {script && 0 !== scriptStepSelectOptions.length && (
        <ScriptStepBlock>
          <ScriptStepBlockTitle>
            <FormattedMessage id="Audits.script_step_selection" />
          </ScriptStepBlockTitle>
          <Select
            defaultValue={scriptStepSelectOptions.find(scriptStepOption => {
              return scriptStepOption.value === scriptStepId;
            })}
            onChange={handleScriptStepSelection}
            options={scriptStepSelectOptions}
            margin={`0 0 ${getSpacing(4)} 0`}
          />
        </ScriptStepBlock>
      )}
      <GraphsBlock blockMargin={`0 0 ${getSpacing(8)} 0`} auditResultIds={sortedAuditResultsIds} />
      <Title>
        <FormattedMessage id="Audits.webpagetest_analysis" />
      </Title>
      <AnalyticsBlock
        blockMargin={`0 0 ${getSpacing(8)} 0`}
        auditResultIds={sortedAuditResultsIds}
      />
    </Container>
  );
};
