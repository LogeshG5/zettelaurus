import React from 'react';
import URI from 'urijs';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useLocation } from '@docusaurus/router';
import Translate from '@docusaurus/Translate';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';
export default function EditThisPage({ editUrl }) {
  const { pathname } = useLocation();
  const activePlugin = useActivePlugin();
  const { editorBasePath } = usePluginData('docusaurus-plugin-docs-editor');

  const getPath = () => {
    if (activePlugin) {
      const {
        pluginData: { path },
      } = activePlugin;
      const relativePath = new URI(pathname).relativeTo(path + '/');
      return URI.joinPaths(editorBasePath, relativePath).toString();
    }
  };

  const editPath = getPath();
  const mapUrl = editUrl.replace("8889", "3000").replace("/edit/", "/mindmap/");
  return (
    <>
      <a href={editUrl} target='_blank' rel='noreferrer noopener'>
        <Translate
          id='theme.common.editThisPage'
          description='The link label to edit the current page'
        >
          Open in editor
        </Translate>
      </a>
      {mapUrl && (
        <>
          <span className='margin-horiz--sm'>|</span>
          <a href={mapUrl} target='_blank' rel='noreferrer noopener'>
            Open in map
          </a>

        </>
      )}
    </>
  );
}
