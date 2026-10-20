{{/*
Create a dockerconfigjson secret.
Usage:
{{ include "imagePullSecret" . }}
*/}}
{{- define "imagePullSecret" }}
{{- with .Values.imageCredentials }}
{{- printf "{\"auths\":{\"%s\":{\"auth\":\"%s\"}}}" .registry (printf "nologin:%s" .password | b64enc) | b64enc }}
{{- end }}
{{- end }}
