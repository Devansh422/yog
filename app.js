document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

    CustomEase.create("hop", ".8, 0, .3, 1");

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    window.lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);




    //Spotlight

    let spotlightTriggers = [];
    let introHeaderSplit = null;
    let outroHeaderSplit = null;

    function initSpotlightAnimations() {
        // Clean up existing instances first
        spotlightTriggers.forEach(trigger => trigger.kill());
        spotlightTriggers = [];

        if (introHeaderSplit) introHeaderSplit.revert();
        if (outroHeaderSplit) outroHeaderSplit.revert();

        const images = document.querySelectorAll(".img");
        const coverImg = document.querySelector(".spotlight-cover-img");
        const introHeader = document.querySelector(".spotlight-intro-header h1");
        const outroHeader = document.querySelector(".spotlight-outro-header h1");

        // Create split text instances
        introHeaderSplit = SplitText.create(introHeader, { type: "words" });
        gsap.set(introHeaderSplit.words, { opacity: 1 });

        outroHeaderSplit = SplitText.create(outroHeader, { type: "words" });
        gsap.set(outroHeaderSplit.words, { opacity: 0 });
        gsap.set(outroHeader, { opacity: 1 });


        const scatterDirections = [
            { x: 1.3, y: 0.7 },
            { x: -1.5, y: 1.0 },
            { x: 1.1, y: -1.3 },
            { x: -1.7, y: -0.8 },
            { x: 0.8, y: 1.5 },
            { x: -1.0, y: -1.4 },
            { x: 1.6, y: 0.3 },
            { x: -0.7, y: 1.7 },
            { x: 1.2, y: -1.6 },
            { x: -1.4, y: 0.9 },
            { x: 1.8, y: -0.5 },
            { x: -1.1, y: -1.8 },
            { x: 0.9, y: 1.8 },
            { x: -1.9, y: 0.4 },
            { x: 1.0, y: -1.9 },
            { x: -0.8, y: 1.9 },
            { x: 1.7, y: -1.0 },
            { x: -1.3, y: -1.2 },
            { x: 0.7, y: 2.0 },
            { x: 1.25, y: -0.2 },
        ];

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight
        const isMobile = screenWidth < 1000;
        const scatterMultiplier = isMobile ? 2.5 : 0.5;

        const startPositions = Array.from(images).map(() => ({
            x: 0,
            y: 0,
            z: -1000,
            scale: 0,
        }));

        const endPositions = scatterDirections.map((dir) => ({
            x: dir.x * screenWidth * scatterMultiplier,
            y: dir.y * screenHeight * scatterMultiplier,
            z: 2000,
            scale: 1,
        }));

        // Set initial positions
        images.forEach((img, index) => {
            gsap.set(img, startPositions[index]);
        });

        gsap.set(coverImg, {
            z: -1000,
            scale: 0,
            x: 0,
            y: 0,
        });

        // Create main spotlight timeline
        const spotlightTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".spotlight",
                start: "top top",
                end: `+=${window.innerHeight * 15}px`,
                pin: true,
                pinSpacing: true,
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;

                    images.forEach((img, index) => {
                        const staggerDelay = index * 0.03;
                        const scaleMultiplier = isMobile ? 4 : 2;

                        let imageProgress = Math.max(0, (progress - staggerDelay) * 4);
                        const start = startPositions[index];
                        const end = endPositions[index];

                        const zValue = gsap.utils.interpolate(start.z, end.z, imageProgress);
                        const scaleValue = gsap.utils.interpolate(
                            start.scale,

                            end.scale,

                            imageProgress * scaleMultiplier

                        );
                        const xValue = gsap.utils.interpolate(start.x, end.x, imageProgress);
                        const yValue = gsap.utils.interpolate(start.y, end.y, imageProgress);

                        gsap.set(img, {
                            z: zValue,
                            scale: scaleValue,
                            x: xValue,
                            y: yValue,
                        });
                    });

                    const coverProgress = Math.max(0, (progress - 0.7) * 4);
                    const coverZValue = -1000 + 1000 * coverProgress;
                    const coverScaleValue = Math.min(1, coverProgress * 2);

                    gsap.set(coverImg, {
                        z: coverZValue,
                        scale: coverScaleValue,
                        x: 0,
                        y: 0,
                    });

                    if (introHeaderSplit && introHeaderSplit.words.length > 0) {
                        if (progress >= 0.6 && progress <= 0.75) {
                            const introFadeProgress = (progress - 0.6) / 0.15;
                            const totalWords = introHeaderSplit.words.length;

                            introHeaderSplit.words.forEach((word, index) => {
                                const wordFadeProgress = index / totalWords;
                                const fadeRange = 0.1;


                                if (introFadeProgress >= wordFadeProgress + fadeRange) {
                                    gsap.set(word, { opacity: 0 });
                                } else if (introFadeProgress <= wordFadeProgress) {
                                    gsap.set(word, { opacity: 1 });
                                } else {
                                    const wordOpacity =
                                        1 - (introFadeProgress - wordFadeProgress) / fadeRange;
                                    gsap.set(word, { opacity: wordOpacity })
                                }
                            });
                        } else if (progress < 0.6) {
                            gsap.set(introHeaderSplit.words, { opacity: 1 });
                        } else if (progress < 0.75) {
                            gsap.set(introHeaderSplit.words, { opacity: 0 });
                        }
                    }


                    if (outroHeaderSplit && outroHeaderSplit.words.length > 0) {
                        if (progress >= 0.8 && progress <= 0.95) {
                            const outroRevealProgress = (progress - 0.8) / 0.15;
                            const totalWords = outroHeaderSplit.words.length;

                            outroHeaderSplit.words.forEach((word, index) => {
                                const wordRevealProgress = index / totalWords;
                                const fadeRange = 0.1;

                                if (outroRevealProgress >= wordRevealProgress + fadeRange) {
                                    gsap.set(word, { opacity: 1 });
                                } else if (outroRevealProgress <= wordRevealProgress) {
                                    gsap.set(word, { opacity: 0 });
                                } else {
                                    const wordOpacity =
                                        (outroRevealProgress - wordRevealProgress) / fadeRange;
                                    gsap.set(word, { opacity: wordOpacity });
                                }
                            });
                        } else if (progress < 0.8) {
                            gsap.set(outroHeaderSplit.words, { opacity: 0 });
                        } else if (progress > 0.95) {
                            gsap.set(outroHeaderSplit.words, { opacity: 1 });
                        }
                    }







                },
            }
        });
    }
    initSpotlightAnimations();






    const cards = gsap.utils.toArray(".card");

    cards.forEach((card, index) => {
        if (index >= cards.length - 1) return; // Skip last card

        const cardInner = card.querySelector(".card-inner");

        // 3D rotation animation
        gsap.fromTo(cardInner, { y: "0%", z: 0, rotationX: 0 }, {
            y: "-50%",
            z: -250,
            rotationX: 45,
            scrollTrigger: {
                trigger: cards[index + 1],
                start: "top 70%",
                end: "top -75%",
                scrub: true,
                pin: card,
                pinSpacing: false,
            }
        });

        // Overlay fade animation
        gsap.to(cardInner, {
            "--after-opacity": 1,
            scrollTrigger: {
                trigger: cards[index + 1],
                start: "top 75%",
                end: "top -25%",
                scrub: true
            }
        });
    });






//hero

    const profileImagesContainer = document.querySelector(".profile-images");
    const profileImages = document.querySelectorAll(".profile-images .pimg");
    const nameElements = document.querySelectorAll(".profile-names .name");
    const nameHeadings = document.querySelectorAll(".profile-names .name h1");


    nameHeadings.forEach((heading) =>{
        const split = new SplitText(heading, {type : "chars"});
        split.chars.forEach((char) =>{
            char.classList.add("letter");
        });
    });

    const defaultLetters = nameElements[0].querySelectorAll(".letter");
    gsap.set(defaultLetters ,{ y : "100%"});

    const bgImages = [
        'test-images/final/test/1.png',
        'test-images/final/test/2.png',
        'test-images/final/test/3.png',
        'test-images/final/test/4.png',
        'test-images/final/test/5.png',
        'test-images/final/test/6.png',
        'test-images/final/test/7.png',
        'test-images/final/test/8.png',
        'test-images/final/test/9.png'
    ];

        profileImages.forEach((img, index) =>{
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");



            img.addEventListener("mouseenter",()=>{
                const hero = document.querySelector('.hero');
                hero.style.backgroundImage = `url(${bgImages[index]})`;
                hero.style.backgroundSize = 'contain';
                hero.style.backgroundRepeat = 'no-repeat';
                hero.style.backgroundPosition = 'left bottom';
                gsap.to(img, {
                    width : 140,
                    height : 140,
                    duration : 0.5,
                    ease : "power4.out",
                });

                gsap.to(letters, {
                    y : "-100%",
                    ease : "power4.out",
                    duration : 0.75,
                    stagger : {
                        each : 0.025,
                        from : "center",
                    },
                });
            });

            img.addEventListener("mouseleave", ()=>{
                gsap.to(img, {
                    width:100,
                    height:100,
                    duration : 0.5,
                    ease : "power4.out",
                });

                gsap.to(letters, {
                    y : "0%",
                    ease : "power4.out",
                    duration : 0.75,
                    stagger : {
                        each : 0.025,
                        from : "center",
                    },
                });
            });
        });

        profileImagesContainer.addEventListener("mouseenter", ()=>{
            gsap.to(defaultLetters, {
                    y : "0%",
                    ease : "power4.out",
                    duration : 0.75,
                    stagger : {
                        each : 0.025,
                        from : "center",
                    },
                });
        });


        profileImagesContainer.addEventListener("mouseleave", ()=>{
            const hero = document.querySelector('.hero');
            hero.style.backgroundImage = `var(--base)`;
            gsap.to(defaultLetters, {
                    y : "100%",
                    ease : "power4.out",
                    duration : 0.75,
                    stagger : {
                        each : 0.025,
                        from : "center",
                    },
                });
        });

    



    const gallery = document.querySelector('.gallery');

    for (let i = 1; i <= 190; i++) {
      const div = document.createElement('div');
      const img = document.createElement('img');
      const num = String(i).padStart(2, '0');
      img.src = `test-images/frames/frame-${num}.png`;
      img.alt = `frame-${num}`;
      div.appendChild(img);
      gallery.appendChild(div);
  }




/* --------------------------
         1) CANVAS SCROLL-SEQUENCE
      ---------------------------*/
      const canvas = document.getElementById("scrollCanvas");
      const ctx = canvas.getContext("2d");
      const totalFrames = 190;

      // Generate paths with 2-digit padding: 01..09, then 10..190
      const framePaths = Array.from({ length: totalFrames }, (_, i) => {
        const num = String(i + 1).padStart(2, "0");
        return `frames/frame-${num}.png`;
      });

      const frames = [];
      canvas.width = 100; 
      canvas.height = 100;

      let loaded = 0, currentFrame = 0, lastFrameIndex = -1;

      // Preload frames
      framePaths.forEach((src, i) => {
        const img = new Image();
        img.onload = img.onerror = () => { 
          if (++loaded === totalFrames) initCanvasAnimation(); 
        };
        img.src = src;
        frames[i] = img;
      });

      const drawState = { y: 0 };

      const drawFrame = () => {
        const f = Math.floor(currentFrame);
        if (frames[f]?.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frames[f], 0, drawState.y);
        }
      };

      const render = () => {
        const f = Math.floor(currentFrame);
        if (frames[f]?.complete) {
          if (f !== lastFrameIndex && lastFrameIndex !== -1) {
            const isForward = f > lastFrameIndex;
            const yOffset = isForward ? 0 : -0;
            gsap.fromTo(drawState, 
              { y: yOffset }, 
              { y: 0, duration: 0.1, ease: "power2.out", overwrite: true, onUpdate: drawFrame }
            );
          }
          lastFrameIndex = f;
          drawFrame();
        }
      };

      function initCanvasAnimation() {
        gsap.registerPlugin(ScrollTrigger);

        // Pin the canvas over the whole section; advance frames with scroll
        ScrollTrigger.create({
          trigger: ".vdoAnimation",
          start: "top top",
          end: "bottom bottom",
          pin: ".canvasContainer",
          pinSpacing: false,
          onUpdate: self => {
            currentFrame = self.progress * (totalFrames - 1);
            render();
          }
        });
        render(); // initial paint
      }

      /* -----------------------------------
         2) PERFECT-FIT TILED "YOG" WALLPAPER
      ------------------------------------*/
      const textGrid = document.getElementById("textGrid");

      function buildGrid() {
        textGrid.innerHTML = "";

        // Measure "YOG" size
        const measurer = document.createElement("span");
        measurer.textContent = "YOG";
        measurer.style.position = "absolute";
        measurer.style.visibility = "hidden";
        measurer.style.whiteSpace = "nowrap";
        measurer.style.fontSize = "4rem";
        measurer.style.fontWeight = "800";
        document.body.appendChild(measurer);
        const rect = measurer.getBoundingClientRect();
        document.body.removeChild(measurer);

        const gapX = 1, gapY = 1;
        const cellW = 80;
        const cellH = 50;

        const cols = Math.ceil(window.innerWidth  / cellW);
        const rows = Math.ceil(window.innerHeight / cellH);

        textGrid.style.gridTemplateColumns = `repeat(${cols}, ${cellW}px)`;
        textGrid.style.gridAutoRows = `${cellH}px`;

        const count = cols * rows + cols; 
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
          const s = document.createElement("span");
          s.textContent = "YOG";
          frag.appendChild(s);
        }
        textGrid.appendChild(frag);

        setupReveal();
      }

      let revealTrigger;
      function setupReveal() {
  if (revealTrigger) revealTrigger.kill();

  const words = Array.from(textGrid.querySelectorAll("span"));
  let last = -1;

  revealTrigger = ScrollTrigger.create({
    trigger: ".vdoAnimation",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    pin: ".text-grid",  
    pinSpacing: false,   
    onUpdate: self => {
      const target = Math.floor(self.progress * words.length);
      if (target > last) {
        for (let i = last + 1; i <= target; i++) {
          const el = words[i]; if (!el) break;
          el.style.opacity = "1";
          el.style.transform = "scale(1)";
        }
      } else if (target < last) {
        for (let i = last; i > target; i--) {
          const el = words[i]; if (!el) break;
          el.style.opacity = "0";
          el.style.transform = "scale(0.85)";
        }
      }
      last = target;
    }
  });
}


      buildGrid();
      let resizeTO;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTO);
        resizeTO = setTimeout(() => {
          ScrollTrigger.refresh();
          buildGrid();
          ScrollTrigger.refresh();
        }, 150);
      });







// SplitText helper function
    const splitTextElements = (selector, type = "words, chars", addFirstChar = false) => {
      const elements = document.querySelectorAll(selector);

      elements.forEach((element) => {
        const splitText = new SplitText(element, {
          type,
          wordClass: "word",
          charsClass: "char",
        });

        if (type.includes("chars")) {
          splitText.chars.forEach((char, index) => {
            const originalText = char.textContent;
            char.innerHTML = `<span>${originalText}</span>`;
            if (addFirstChar && index === 0) {
              char.classList.add("first-char");
            }
          });
        }
      });
    };

    // Apply SplitText
    splitTextElements(".intro-line h1", "words, chars", true);
    splitTextElements(".outro-title h1");

    const isMobile = window.innerWidth <= 1000;

    // Initial GSAP sets
    gsap.set(
      [
        ".split-overlay .intro-line .first-char span",
        ".split-overlay .outro-title .char span",
      ],
      { y: "0%" }
    );

    gsap.set(".split-overlay .intro-line .first-char", {
      x: isMobile ? "7.5rem" : "18rem",
      y: isMobile ? "-1rem" : "-2.75rem",
      fontWeight: "900",
      scale: 0.75,
    });

    gsap.set(".split-overlay .outro-title .char", {
      x: isMobile ? "-3rem" : "-8rem",
      y : isMobile ? "3rem" : "5rem",
      fontSize: isMobile ? "11rem" : "25rem",
      fontWeight: "500",
    });

    // Timeline
    const preloadertl = gsap.timeline({ defaults: { ease: "hop" } });

    preloadertl.to(".preloader .intro-line .char span", {
      y: "0%",
      duration: 0.75,
      stagger: 0.05,
    }, 0.5)
    .to(".preloader .intro-line .char:not(.first-char) span", {
      y: "100%",
      duration: 0.75,
      stagger: 0.05,
    }, 2)
    .to(".preloader .outro-title .char span", {
      y: "0%",
      duration: 0.75,
      stagger: 0.075,
    }, 2.5)
    .to(".preloader .intro-line .first-char", {
      x: isMobile ? "6.4rem" : "16rem",
      duration: 1,
    }, 3.5)
     .to(".preloader .outro-title .char", {
       x: isMobile ? "-3rem" : "-8rem",
       duration: 1,
    }, 3.5)
    .to(".preloader .intro-line .first-char", {
      x: isMobile ? "4rem" : "13rem",
      y: isMobile ? "-1rem" : "-2.75rem",
      fontWeight: "900",
      scale: 0.75,
      duration: 0.75,
    }, 4.5)
    .to(".preloader .outro-title .char", {
      x: isMobile ? "-3rem" : "-8rem",
      y : isMobile ? "3rem" : "5rem",
      fontSize: isMobile ? "11rem" : "25rem",
      fontWeight: "500",
      duration: 0.75,
      onComplete: () => {
        gsap.set(".preloader", {
          clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
        });
        gsap.set(".split-overlay", {
          clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
        });
      },
    }, 4.5).to([".preloader", ".split-overlay"],{
      y : (i) => (i == 0 ? "-50%" : "50%"),
      duration : 1,
    },5.5);







    
    const flowers = document.querySelectorAll(".flower-container > img");
	
	// Pre-extract the target rotations from CSS
	const targetRotations = [
		-32, 15, -42, 28, -5, 12, -20, 40, -38, 22
	];

	// Initial State
	gsap.set(flowers, {
		y: "0%",
		rotation: 0
	});

	// Trigger animation on scroll
	const animateFlowers = () => {
		// Kill any existing wiggle tweens
		gsap.killTweensOf(flowers);
		
		gsap.fromTo(flowers, 
			{ y: "20%", rotation: 0 },
			{
				y: 0,
				rotation: (i) => targetRotations[i],
				duration: 1.5,
				ease: "power3.out",
				stagger: 0.1,
				onComplete: () => {
					// Gentle wiggle after slide-in
					flowers.forEach((flower, i) => {
						const baseAngle = targetRotations[i];
						gsap.to(flower, {
							rotation: baseAngle + 5,
							duration: 2 + Math.random(),
							repeat: -1,
							yoyo: true,
							ease: "sine.inOut"
						});
					});
				}
			}
		);
	};

	ScrollTrigger.create({
		trigger: ".flower-container",
		start: "top 100%",
		onEnter: animateFlowers,
		onEnterBack: animateFlowers,
		onLeaveBack: () => {
			gsap.killTweensOf(flowers);
			gsap.set(flowers, { y: "100%", rotation: 0 });
		}
	});














});