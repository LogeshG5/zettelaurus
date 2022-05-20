import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './create-new-doc.module.css';
import HomepageFeatures from '../components/HomepageFeatures';


async function uploadFile(url, blob, dir, fileName) {
  let formData = new FormData();
  formData.append("dir", dir);
  formData.append("file", blob, fileName);

  let response = await fetch(url + '/upload-file', {
    method: 'POST',
    body: formData
  });
  // open url immediately so hotreload doesn't interfere
  window.open('edit/docs/' + dir + fileName);
  let result = await response.json();
  console.log(result.message);
}

function createNewDoc(url, dir, title) {
  const text = "# " + title;
  const fileName = title.replaceAll(" ", "-").toLowerCase() + ".md";
  let file = new File([text], fileName);
  uploadFile(url, file, dir, fileName);
}

function createNew(url) {
  createNewDoc(url, document.getElementById("dirs").value, document.getElementById("fname").value);
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h2 className="hero__title">Create New Document</h2>
        <label htmlFor="dirs">Select Directory</label>
        <select className={styles.cselect} name="dirs" id="dirs">
          <option value=""></option>
        </select>
        <label htmlFor="fname">Title</label>
        <input className={styles.cselect} type="text" id="fname" name="fname"
        />
        <div className={styles.buttons}>
          <input className="button button--secondary button--lg"
            type="button" value="Create" onClick={() => createNew(siteConfig.customFields.contentServer)} />
        </div>
      </div>
    </header >
  );
}

function populateDirs(url) {
  fetch(url + "/dirs/")
    .then(response => response.text()) // Gets the response and returns it as a blob
    .then(blob => {
      const select = document.getElementById('dirs');
      blob = JSON.parse(blob);
      for (var i = 0; i < blob.length; i++) {
        var opt = document.createElement('option');
        opt.value = blob[i];
        opt.innerHTML = blob[i];
        select.add(opt);
      }
    });
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  useEffect(() => {
    populateDirs(siteConfig.customFields.contentServer);
  });
  return (
    <Layout
      title={"Create"}
      description="Create new document <head />">
      <HomepageHeader />
      <main>
      </main>
    </Layout>
  );
}

