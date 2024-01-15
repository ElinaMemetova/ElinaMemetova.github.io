
const styleElement = document.createElement('style');
const cssRule = `
  body {
    font-family: 'IBM Plex Mono', monospace;
  }
`;
styleElement.appendChild(document.createTextNode(cssRule));
document.head.appendChild(styleElement);

var isLoggedIn = false;
const ns = "http://www.w3.org/2000/svg"
function getEmailAndPassword() {
  return {
    email: document.getElementById('login-email'),
    password: document.getElementById('login-password')
  };
}

function checkLogin() {
  const { email, password } = getEmailAndPassword();
  return email.value !== '' && password.value !== '';
}

function login() {
  isLoggedIn = true;
  const { email, password } = getEmailAndPassword();
  email.value = '';
  password.value = '';
  updateUI();
}

function logout() {
  isLoggedIn = false;
  updateUI();
}
function updateUI() {
  var loginContainer = document.getElementById('login-container');
  if (isLoggedIn) {
    loginContainer.style.display = 'none';
  } else {
    loginContainer.style.display = 'flex';
    const body = document.querySelector('body');
    const main = document.querySelector('main');
    body.removeChild(main);
    localStorage.removeItem('jwt_token');
  }
}
function createListItem(content) {
  const item = document.createElement('li');
  item.innerText = content;
  return item;
}

function displayStudentProfile(id, username, attributes) {
  const profileInfoContainer = document.createElement('article');
  profileInfoContainer.className = 'userInfo';

  const welcomeMessageHeading = document.createElement('h1');
  welcomeMessageHeading.innerText = "information about student";
  welcomeMessageHeading.style.textAlign = 'center';
  welcomeMessageHeading.style.textDecoration = 'underline';
  profileInfoContainer.appendChild(welcomeMessageHeading);

  const userInfoWrapper = document.createElement('ul');
  userInfoWrapper.appendChild(createListItem(`Student id: ${id}`));
  userInfoWrapper.appendChild(createListItem(`Username: ${username}`));

  Object.entries(attributes).forEach(([key, value]) => {
    if (['firstName', 'lastName', 'country', 'email', 'nationality'].includes(key)) {
      userInfoWrapper.appendChild(createListItem(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`));
    }
  });

  profileInfoContainer.appendChild(userInfoWrapper);
  return profileInfoContainer;
}
function displayAuditRatio(auditXpDown, auditXpUp) {
  const wrapper = document.createElement('article')
  wrapper.classList.add('auditRatio')
  
  const ratio = Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(auditXpUp / auditXpDown)
  const heading = document.createElement('h1')
  heading.innerText = 'audits ratio'
  heading.style.textAlign = 'center'
  heading.style.textDecoration = 'underline'
  wrapper.appendChild(heading)
  let formattedUpstreamXP
  let formattedDownstreamXP
  if (auditXpUp.toString().length >= 6) {
    formattedUpstreamXP = Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(parseInt(auditXpUp))
  } else {
    formattedUpstreamXP = Intl.NumberFormat("en", { notation: "compact", maximumSignificantDigits: 3 }).format(parseInt(auditXpUp))
  }
  if (auditXpDown.toString().length >= 6) {
    formattedDownstreamXP = Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(parseInt(auditXpDown))
  } else {
    formattedDownstreamXP = Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(parseInt(auditXpDown))
  }
  const doneGraph = document.createElementNS(ns, 'svg')
  const receivedGraph = document.createElementNS(ns, 'svg')
  doneGraph.setAttribute('viewBox', '0 0 100 10')
  receivedGraph.setAttribute('viewBox', '0 0 100 10')
  const doneRect = document.createElementNS(ns, 'rect')
  const recievedRect = document.createElementNS(ns, 'rect')
  if ((ratio - 1) > 0) {
    doneRect.setAttribute('width', '100')
    less = 100 - 100 * (ratio - 1)
    recievedRect.setAttribute('width', `${less}`)
  } else if ((ratio - 1 < 0)) {
    recievedRect.setAttribute('width', '100')
    less = 100 - 100 * (1 - ratio)
    doneRect.setAttribute('width', `${less}`)
  } else {
    doneRect.setAttribute('width', '100')
    recievedRect.setAttribute('width', '100')
  }
  doneRect.setAttribute('height', '5')
  recievedRect.setAttribute('height', '5')
  doneRect.setAttribute('fill', '#c5dbc4')
  recievedRect.setAttribute('fill', 'rgb(207, 139, 163)')
  doneGraph.appendChild(doneRect)
  receivedGraph.appendChild(recievedRect)
  const done = document.createElement('p')
  done.innerText = `Done ${formattedUpstreamXP}`
  wrapper.appendChild(done)
  wrapper.appendChild(doneGraph)
  const recieved = document.createElement('p')
  recieved.innerText = `Received ${formattedDownstreamXP}`
  wrapper.appendChild(recieved)
  wrapper.appendChild(receivedGraph)
  const displayRatio = document.createElement('p')
  displayRatio.innerText = `Your audit ratio: ${ratio}`
  wrapper.appendChild(displayRatio)
  return wrapper
}
function displayStudentSkills(data) {
  const wrapper = document.createElement('article')
  const heading = document.createElement('h1')
  heading.innerText = 'student`s skills'
  heading.style.textAlign = 'center'
  heading.style.textDecoration = 'underline'
  wrapper.appendChild(heading)
  let skills = []
  let skillNames = new Set()
  let userSkillProgress = new Map
  for (const [key, value] of Object.entries(data.transactions)) {
    if (value.type.includes('skill')) {
      skills.push(value)
      skillNames.add(value.type.split('skill_')[1])
    }
  }
  for (const [key, value] of Object.entries(skills)) {
    const skillName = value.type.split('skill_')[1]
    const userSkillProgression = value.amount
    if (skillNames.has(skillName)) {
      if (userSkillProgress.has(skillName) && userSkillProgress.get(skillName) < userSkillProgression) {
        userSkillProgress.set(skillName, userSkillProgression)
      } else if (!userSkillProgress.has(skillName)) {
        userSkillProgress.set(skillName, userSkillProgression)
      }
    }
  }
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 120 120')
  svg.setAttribute('style', 'overflow: visible')
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('fill', 'none')
  circle.setAttribute('stroke', 'rgb(0, 0, 0)')
  circle.setAttribute('stroke-width', '0.75')
  circle.setAttribute('cx', '60')
  circle.setAttribute('cy', '60')
  circle.setAttribute('r', '30')
  console.log(userSkillProgress)
  svg.appendChild(circle)
  skillNames = Array.from(skillNames)
  const path = document.createElementNS(ns, 'path')
  path.setAttribute('fill', 'rgba(207, 139, 163, 0.9)')
  let constructedPath = ''
  for (let i = 0; i < 12; i++) {
    let group = document.createElementNS(ns, 'g')
    group.classList.add('sector')
    let line = document.createElementNS(ns, 'line')
    let angle = (Math.PI / 6) * i
    let x = 60 + 30 * Math.cos(angle)
    let y = 60 + 30 * Math.sin(angle)
    line.setAttribute("x1", x.toString())
    line.setAttribute("y1", y.toString())
    line.setAttribute("x2", "60")
    line.setAttribute("y2", "60")
    line.setAttribute('stroke', 'rgb(0, 0, 0)')
    line.setAttribute('stroke-width', '0.75')
    group.appendChild(line)
    let text = document.createElementNS(ns, 'text')
    text.setAttribute('x', (60 + 47 * Math.cos(angle)).toString())
    text.setAttribute('y', (60 + 47 * Math.sin(angle)).toString())
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'middle')
    text.setAttribute('font-size', '6px')
    text.innerHTML = `${skillNames[i]}`
    const tooltip = document.createElementNS(ns, 'title')
    tooltip.textContent = `Progress: ${userSkillProgress.get(skillNames[i])}`
    text.appendChild(tooltip)
    group.appendChild(text)
    if (i === 0) {
      constructedPath += `M ${60 + 30 * Math.cos(angle) * (userSkillProgress.get(skillNames[i]) / 100)} ${60 + 30 * Math.sin(angle) * (userSkillProgress.get(skillNames[i]) / 100)}`
    } else {
      constructedPath += ` L ${60 + 30 * Math.cos(angle) * (userSkillProgress.get(skillNames[i]) / 100)} ${60 + 30 * Math.sin(angle) * (userSkillProgress.get(skillNames[i]) / 100)}`
    }
    svg.appendChild(group)
  }
  path.setAttribute('d', constructedPath)
  svg.appendChild(path)
  wrapper.appendChild(svg)
  wrapper.classList.add('skills')
  return wrapper
}
function displayXpByProject(transactions) {
  const wrapper = document.createElement('article');
  const title = document.createElement('h1');
  title.textContent = 'XP by project';
  title.style.textAlign = 'center';
  title.style.textDecoration = 'underline';
  wrapper.appendChild(title);

  let projectTransactions = [];
  let userXp = 0;
  for (const value of Object.values(transactions)) {
    if (value.type === 'xp' && !value.path.includes('piscine')) {
      projectTransactions.push(value);
      userXp += value.amount;
    }
  }

  const maxXP = Math.max(...projectTransactions.map(t => t.amount));
  const svg = document.createElementNS(ns, 'svg');
  const barHeight = 7; 
  const chartHeight = barHeight * projectTransactions.length;
  svg.setAttribute('viewBox', `0 0 200 ${chartHeight}`);
  svg.style.width = '100%'; 

  projectTransactions.forEach((value, index) => {
    const barLength = (value.amount / maxXP) * 180;
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('height', barHeight - 2); 
    rect.setAttribute('width', barLength);
    rect.setAttribute('y', index * barHeight + 2);
    rect.setAttribute('x', 40);
    rect.setAttribute('fill', randomColour());

    const projectName = document.createElementNS(ns, 'text');
    projectName.setAttribute('x', 5);
    projectName.setAttribute('y', index * barHeight + barHeight / 2 + 2);
    projectName.textContent = value.path.split('/')[3];
    projectName.style.fontSize = '4px';
    projectName.style.fill = 'black';

    const xpText = document.createElementNS(ns, 'text');
    xpText.setAttribute('x', 40);
    xpText.setAttribute('y', index * barHeight + barHeight / 2 + 2);
    xpText.textContent = `${formatKilobytes(value.amount)} XP`;
    xpText.style.fontSize = '4px';
    xpText.style.fill = 'black';
    xpText.style.visibility = 'hidden';

    rect.addEventListener('mouseover', () => {
      xpText.style.visibility = 'visible';
    });
    rect.addEventListener('mouseleave', () => {
      xpText.style.visibility = 'hidden';
    });

    svg.appendChild(rect);
    svg.appendChild(projectName);
    svg.appendChild(xpText);
  });

  wrapper.appendChild(svg);
  wrapper.classList.add('xp');

  const changeColours = document.createElement('button');
  changeColours.innerText = 'Change colours';
  changeColours.addEventListener('click', () => {
    const rects = Array.from(svg.querySelectorAll('rect'));
    rects.forEach(rect => rect.setAttribute('fill', randomColour()));
  });
  wrapper.appendChild(changeColours);

  const info = document.createElement('p');
  info.textContent = `Total user XP: ${formatKilobytes(userXp)}`;
  wrapper.appendChild(info);

  return wrapper;
}

function randomColour() {
  return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

function formatKilobytes(kilobytes) {
  if (kilobytes === 0) return '0 KB';

  const k = 1024;
  const sizes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(kilobytes) / Math.log(k));

  if (i === 0) {
    return kilobytes.toFixed(2) + ' ' + sizes[i];
  } else {
    return (kilobytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }
}



function displayWelcomeMsg(username) {
  const wrapper = document.createElement('article');
  wrapper.classList.add('welcome');
  wrapper.style.background = 'white';
  wrapper.style.width = '100%';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'space-between';
  wrapper.style.alignItems = 'center';
  wrapper.style.padding = '10px';

  const welcomeMsg = document.createElement('h1');
  welcomeMsg.innerText = `Welcome, ${username}!`;

  welcomeMsg.style.margin = '0';
  welcomeMsg.style.textAlign = 'center';
  welcomeMsg.style.flex = '1';

  const logoutBtn = document.createElement('button');
  logoutBtn.innerText = 'LOGOUT';

  logoutBtn.style.backgroundColor = 'transparent';
  logoutBtn.style.border = 'none';
  logoutBtn.style.cursor = 'pointer';

  logoutBtn.addEventListener('click', logout);

  wrapper.appendChild(welcomeMsg);
  wrapper.appendChild(logoutBtn);

  return wrapper;
}

function displayUserData(data) {
  const page = document.querySelector('body')
  const studentInfo = document.createElement('main')
  studentInfo.classList.add('parent')
  page.appendChild(studentInfo)
  const welcomeBanner = displayWelcomeMsg(data.login)
  studentInfo.appendChild(welcomeBanner)
  const profile = displayStudentProfile(data.id, data.login, data.attrs)
  studentInfo.appendChild(profile)
  const audit = displayAuditRatio(data.totalDown, data.totalUp)
  studentInfo.appendChild(audit)
  const skills = displayStudentSkills(data)
  studentInfo.appendChild(skills)
  const projectXp = displayXpByProject(data.transactions)
  studentInfo.appendChild(projectXp)
}
async function fetchServerData() {
  const query = `
                    query {
                        user {
                            id
                            login
                            attrs
                            totalUp
                            totalDown
                            createdAt
                            updatedAt
                            transactions(order_by: { createdAt: asc }) {
                                id
                                userId
                                type
                                amount
                                createdAt
                                path
                            }
                        }
                    }`;
  await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    },
    body: JSON.stringify({ query })
  }).then(response => {
    if (!response.ok) {
      console.log('query problem', response)
    } else {
      return response.json()
    }
  }).then(data => {
    console.log(data)
    console.log(data.data.user)
    displayUserData(data.data.user[0])
  }).catch(error => {
    console.log(error)
  })
};
document.getElementById('login-submit').addEventListener('click', async (e) => {
  e.preventDefault()
  if (checkLogin()) {
    await fetch('https://01.kood.tech/api/auth/signin', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${document.getElementById('login-email').value}:${document.getElementById('login-password').value}`)}`
      }
    }).then(response => {
      if (response.status != 200) {
        console.log(response)
        throw new Error('Trouble logging in. Please try again.')
      } else {
        return response.json()
      }
    }).then(token => {
      login()
      localStorage.setItem('jwt_token', token)
      fetchServerData()
    }).catch(error => {
      alert(error.message)
    })
  } else {
    alert('Invalid login credentials. Please try logging again.')
  }
});