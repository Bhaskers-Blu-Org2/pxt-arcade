interface Session {
    title: string;
    description: string;
    presenter: string;
    imgSrc?: string;
    time: number; // hour in PST, 24 hr clock
    date: Date; // month and day pulled from date
    ics?: string; // ics file for event
}

const sessions: Session[] = [
    {
        "title": "Level Design in Games with Sten Huebler",
        "description": "Learn about the effect of different level layouts to the gameplay experience. Sten is a Senior Level Designer at The Coalition, working on Gears of War, making awesome looking and fun levels. He also worked on Crysis and has a passion for Flight Sims.",
        "presenter": "Sten Huebler",
        "imgSrc": "/static/gamejam/img/sten.png",
        "time": 13,
        "date": new Date(2020, 5, 11),
        "ics": "/static/gamejam/Level-Design-in-Games.ics"
    },
    {
        "title": "Q & A with Stu Maxwell",
        "description": "Join Stu Maxwell, the lead VFX artist at The Coalition, as we talk about how to make games look great! Stu makes Gears games feel explosive and atmospheric, and also made the indie game Shape of the World.",
        "presenter": "Stu Maxwell",
        "imgSrc": "/static/gamejam/img/stu.png",
        "time": 13,
        "date": new Date(2020, 5, 16),
        "ics": "/static/gamejam/Q-and-A-with-Stu-Maxwell.ics"
    }
]

interface Game {
    id: string;
    title: string;
    author?: string;
}

const featured: Game[] = [
    /* fill in with real games once we have submissions
    {
        id: "73451-52337-17892-07991",
        title: "test game",
        author: "test author"
    }
    */
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const START_DATE = new Date("2020-06-10 00:00:00 GMT-0700").getTime(); // midnight PST June 10
const END_DATE = new Date("2020-07-02 00:00:00 GMT-0700").getTime(); // midnight PST July 1

makeTimer();
makeRules();
makeGallery();
makeSchedule();

initTelemetry();

function initTelemetry() {
    // Watch on mixer button
    document.getElementById("mixer").addEventListener("click", () => {
        (window as any).pxtTickEvent("gamejam.mixer")
    })
    // Submit on itch.io button
    document.querySelector(".submit .button:nth-child(1)").addEventListener("click", () => {
        (window as any).pxtTickEvent("gamejam.submit.itchio")
    })
    // Submit with office forms button
    document.querySelector(".submit .button:nth-child(2)").addEventListener("click", () => {
        (window as any).pxtTickEvent("gamejam.submit.forms")
    })
}

function initRulesTelemetry() {
    // Try one of our tutorials text link
    document.querySelector("#gardening-tips + ul li:nth-child(1) a").addEventListener("click", () => {
        (window as any).pxtTickEvent("gamejam.link.tutorial")
    })
    // How to import images text link
    document.querySelector("#gardening-tips + ul li:nth-child(3) a").addEventListener("click", () => {
        (window as any).pxtTickEvent("gamejam.link.images")
    })
    // Developer documentation text link
    document.querySelector("#gardening-tips + ul li:nth-child(4) a").addEventListener("click", () => {
        (window as any).pxtTickEvent("gamejam.link.developer")
    })
}

function makeTimer() {
    const now = Date.now();
    if (now < END_DATE) {
        const parent = document.getElementById("timer");
        const label = document.createElement("div");
        const labelText = document.createElement("h3");
        label.className = "label";
        label.appendChild(labelText);
        parent.appendChild(label);

        const timer = document.createElement("div");
        timer.appendChild(makeTimeCounter("days"));
        timer.appendChild(makeTimeCounter("hours"));
        timer.appendChild(makeTimeCounter("minutes"));
        timer.appendChild(makeTimeCounter("seconds"));
        parent.appendChild(timer);

        if (now < START_DATE) {
            labelText.innerText = "Starts in:";
        } else {
            labelText.innerText = "Ends in:";
        }
        setTimer();

        setInterval(setTimer, 1000);
    }
}

function makeTimeCounter(id: string) {
    const counter = document.createElement("div");
    counter.id = id;
    counter.className = "counter";
    const count = document.createElement("div");
    count.className = "number";
    counter.appendChild(count);
    const label = document.createElement("div");
    label.textContent = id;
    counter.appendChild(label);
    return counter;
}

function setTimer() {
    const now = Date.now();
    let delta = Math.floor((now < START_DATE ? START_DATE - now : END_DATE - now) / 1000);

    let dayCounter = document.querySelector("#days .number") as HTMLElement;
    dayCounter.innerText = Math.floor(delta / 86400).toString();
    delta = delta % 86400;

    let hourCounter = document.querySelector("#hours .number") as HTMLElement;
    hourCounter.innerText = Math.floor(delta / 3600).toString();
    delta = delta % 3600;

    let minuteCounter = document.querySelector("#minutes .number") as HTMLElement;
    minuteCounter.innerText = Math.floor(delta / 60).toString();
    delta = delta % 60;

    let secondCounter = document.querySelector("#seconds .number") as HTMLElement;
    secondCounter.innerText = delta.toString();
}

function makeRules() {
    let rulesRequest = new XMLHttpRequest();
    rulesRequest.addEventListener("load", onLoad);
    rulesRequest.open("GET", "/static/gamejam/rules.md");
    rulesRequest.send();

    function onLoad() {
        marked.setOptions({
            // @ts-ignore
            sanitizer: DOMPurify.sanitizer,
        });
        let markdown = marked(this.responseText);
        const parent = document.getElementById("rules");
        parent.innerHTML = markdown;

        // insert schedule of events after rules
        const node = document.getElementById("make-it-a-garden-party");
        node.parentElement.insertBefore(document.getElementById("events"), node);
        initRulesTelemetry();
      }
}

function makeGallery() {
    if (!featured.length) {
        let description = document.querySelector(".gallery .description") as HTMLElement;
        description.innerText = "Check back later to play some submitted games!"
    }

    let submittedGames = featured.slice();
    let selected = [];
    for (let i = 0; i < 3; i++) {
        if (submittedGames.length) {
            let idx = Math.floor(Math.random() * submittedGames.length);
            selected.push(submittedGames[idx]);
            submittedGames.splice(idx, 1);
        }
    }

    const parent = document.getElementById("gallery");
    for (const game of selected) {
        let card = document.createElement("div");
        card.className = "game";

        let link = document.createElement("a");
        link.href = `https://arcade.makecode.com/${game.id}`;
        let textLink = link.cloneNode() as HTMLElement;
        let img = document.createElement("img");
        img.src = `https://pxt.azureedge.net/api/${game.id}/thumb`;
        link.appendChild(img);
        card.appendChild(link);

        let label = document.createElement("div");
        textLink.innerText = game.title;
        label.appendChild(textLink);
        if (game.author) {
            let author = document.createElement("div");
            author.innerText = `by ${game.author}`;
            label.appendChild(author);
        }
        card.appendChild(label);

        parent.appendChild(card);
    }
}

function makeSchedule() {
    const sorted = sessions.sort((a, b) => a.date < b.date ? -1 : 1);
    const parent = document.getElementById("schedule");
    for (const session of sorted) {
        const row = document.createElement("div");
        row.className = "event";

        const text = document.createElement("div");
        text.className = "text";
        const title = document.createElement("div");
        title.className = "title";
        title.innerText = session.title;

        const ics = document.createElement("a");
        ics.className = "ics";
        ics.href = session.ics;
        const icon = document.createElement("i");
        icon.className = "icon calendar";
        ics.appendChild(icon);
        title.appendChild(ics);

        row.appendChild(title)

        const details = document.createElement("div");
        details.className = "details";
        const imgContainer = document.createElement("div");
        imgContainer.className = "image"
        const img = document.createElement("img");
        img.src = session.imgSrc;
        imgContainer.appendChild(img)
        details.appendChild(imgContainer)

        const date = document.createElement("div");
        date.className = "date";
        date.innerText = `${formatDate(session.date)}, ${formatTime(session.time)}`;
        text.appendChild(date);

        const description = document.createElement("div");
        description.innerText = session.description;
        text.appendChild(description)
        details.appendChild(text)
        row.appendChild(details)
    
        parent.appendChild(row);
    }
}
function formatTime(time: number): string {
    const EST = time + 3;
    return `${time % 12 || 12} ${time < 12 ? "AM" : "PM"} PDT / ${EST % 12 || 12} ${EST < 12 ? "AM" : "PM"} EDT`;
}

function formatDate(date: Date): string {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}