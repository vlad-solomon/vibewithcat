require("dns").resolve("www.google.com", function (err) {
	if (err) {
		$(".not-connected").addClass("visible");
	} else {
		$(".not-connected").removeClass("visible");
	}
});

var win = nw.Window.get();
let scale = 100;
let zoomLevel = 0;

function resizeDesktop(width, height) {
	scale = Math.min(height / 1080, width / 1920);
	zoomLevel = Math.log(scale) / Math.log(1.2);
	win.zoomLevel = zoomLevel;
}

win.on("loaded", function () {
	resizeDesktop(win.width, win.height);
});

win.on("resize", () => {
	resizeDesktop(win.width, win.height);
});

win.on("maximize", () => {
	resizeDesktop(win.width, win.height);
});

win.on("restore", () => {
	resizeDesktop(win.width, win.height);
});

$("a[target=_blank]").on("click", function () {
	require("nw.gui").Shell.openExternal(this.href);
	return false;
});

const iframes = $("iframe");
const random = ["is digging", "is grooving on", "is having a great time with", "is vibing (duh) to", "is bopping the pain away with", "didn't choose violence this morning because of "];

$("#link-cta").click(() => {
	$(".link-modal").addClass("visible");
});

$("#video-state").click(function () {
	switch ($(this).children("img").attr("src")) {
		case "img/pause.svg":
			$(this).children("img").attr("src", "img/play.svg");
			ytVideo("pause");
			break;
		case "img/play.svg":
			$(this).children("img").attr("src", "img/pause.svg");
			ytVideo("play");
			break;
	}
});

$("#close-modal").click(() => {
	$(".link-modal").removeClass("visible");
	$("#link").val("");
});

$("#relink").click(() => {
	$(".link-modal").addClass("visible");
});

function ytVideo(state) {
	Array.prototype.forEach.call(iframes, (iframe) => {
		iframe.contentWindow.postMessage(
			JSON.stringify({
				event: "command",
				func: `${state}Video`,
			}),
			"*"
		);
	});
	eval(`$("video")[0].${state}()`);
}

let parent = "https://www.youtube.com/embed/";
let options = "&enablejsapi=1&loop=1&modestbranding=1&controls=0&iv_load_policy=3";
let final;

$("#vibe").click(function () {
	let link = $("#link").val().trim();
	$("#link").val("");
	$("#video-state").children("img").attr("src", "img/pause.svg");
	if (link.includes("radio")) {
		handleInvalid();
		return true;
	}
	if (link.includes("https://www.youtube.com/watch?v=") || link.includes("https://youtu.be")) {
		if (link.includes("v=") && link.includes("list=")) {
			let playlistLink = link.split("list=")[1].replace("index=1", "");
			if (playlistLink.length >= 18) {
				final = `${parent}videoseries?list=${playlistLink}${options}`;
				handleValid();
			} else {
				handleInvalid();
			}
		} else if (link.includes("v=")) {
			let normalLink = link.split("v=")[1];
			if (normalLink.length === 11) {
				final = `${parent}${normalLink}?playlist=${normalLink}${options}`;
				handleValid();
			} else {
				handleInvalid();
			}
		} else if (link.includes("youtu.be")) {
			let shortLink = link.split("youtu.be/")[1];
			if (shortLink.length === 11) {
				final = `${parent}${shortLink}?playlist=${shortLink}${options}`;
				handleValid();
			} else {
				handleInvalid();
			}
		}
	} else {
		handleInvalid();
	}
});

function handleInvalid() {
	$("#link").addClass("animate__shakeX");
	$("#vibe").css("pointer-events", "none");
	setTimeout(function () {
		$("#link").removeClass("animate__shakeX");
		$("#vibe").removeAttr("style");
	}, 1000);
}

function handleValid() {
	$("iframe").attr("src", final);
	$(".link-modal").removeClass("visible");
	$(".cta-container h1").text("Take a break and vibe with the cat while listening!");
	$(".cta-container span:first-of-type").html("Age restricted or flagged content will not play, but the cat will sure groove to silence though.<br>Avoid copyrighted material for best results.");
	$("#link-cta").css("display", "none");
	$(".controls").css("display", "flex");
	$(".cat video").removeClass("background-active");
	setTimeout(function () {
		ytVideo("play");
		$("#cat-waiting").text(`The cat ${random[Math.floor(Math.random() * random.length)]} this song`);
	}, 1000);
}

$(document).on("keydown", function (e) {
	switch (e.key) {
		case "Tab":
			e.preventDefault();
			break;
		case "Enter":
			if ($(".link-modal").hasClass("visible")) {
				$("#vibe").trigger("click");
			}
			break;
	}
});
