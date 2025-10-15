document.addEventListener('DOMContentLoaded', function () {
    console.log('Страница загружена');

    const walkButton = document.getElementById('walkButton');
    const okText = document.getElementById('okText');
    const catStand = document.getElementById('catStand');
    const catWalk = document.getElementById('catWalk');
    const closedBook = document.getElementById('closedBook');
    const overlay = document.getElementById('overlay');
    const openBook = document.getElementById('openBook');
    const arrowLeft = document.getElementById('arrowLeft');
    const arrowRight = document.getElementById('arrowRight');
    const navigationArrows = document.getElementById('navigationArrows');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const meowSound = document.getElementById('meowSound');
    const catStepsSound = document.getElementById('catStepsSound');
    const thirdSlide = document.getElementById('thirdSlide');
    const fourthSlide = document.getElementById('fourthSlide');
    const birthdayVideo = document.getElementById('birthdayVideo');
    const playButton = document.querySelector('.play-button');
    const fifthSlide = document.getElementById('fifthSlide');

    initNavigation();

    let currentSlide = 0;
    let musicStarted = false;
    let stepsInterval = null;
    let tailWagInterval = null;
    let photoInterval = null;
    let currentPhotoIndex = 0;
    const photos = [];

    // Загрузка фотографий
    for (let i = 1; i <= 5; i++) {
        const photo = document.getElementById('photo' + i);
        if (photo) {
            photos.push(photo);
        }
    }

    let killua = null;
    let killuaBlink = null;
    let blinkTimeout = null;

    let lightnings = [];
    let lightningInterval = null;
    let currentLightningIndex = 0;

    let clickerMain = null;
    let clickerCounter = null;
    let clickCount = 0;

    let clickButton = null;
    let shopButton = null;
    let clickerShop = null;
    let currentMode = 'clicker';

    const itemPrices = [20, 40, 60, 80, 100];
    let purchasedItems = [];

    function initVideo() {
        if (!birthdayVideo || !playButton) return;

        birthdayVideo.volume = 0.05;

        playButton.addEventListener('click', function (e) {
            e.stopPropagation();
            playVideo();
        });

        birthdayVideo.addEventListener('play', function () {
            playButton.style.display = 'none';
        });

        birthdayVideo.addEventListener('pause', function () {
            playButton.style.display = 'block';
        });

        birthdayVideo.addEventListener('ended', function () {
            playButton.style.display = 'block';
            birthdayVideo.currentTime = 0;
        });
    }

    function playVideo() {
        if (!birthdayVideo) return;

        birthdayVideo.play()
            .then(() => {
                console.log('Видео запущено');
            })
            .catch((error) => {
                console.error('Ошибка воспроизведения:', error);
            });
    }


    function initClickerGame() {
        console.log('Инициализация кликера...');
        clickerMain = document.getElementById('clickerMain');
        clickerCounter = document.getElementById('clickerCounter');
        clickerShop = document.getElementById('clickerShop');
        clickButton = document.getElementById('clickButton');
        shopButton = document.getElementById('shopButton');
        killua = document.getElementById('killua');
        killuaBlink = document.getElementById('killuaBlink');

        lightnings = [
            document.getElementById('lightning1'),
            document.getElementById('lightning2'),
            document.getElementById('lightning3')
        ];

        clickCount = 0;
        updateClickCounter();
        initShopItems();
        currentMode = 'clicker';

        setMode('clicker');

        if (clickerScreen) {
            clickerScreen.addEventListener('click', handleClickerClick);
        }

        if (clickButton) {
            clickButton.addEventListener('click', function () {
                setMode('clicker');
            });
        }

        if (shopButton) {
            shopButton.addEventListener('click', function () {
                setMode('shop');
            });
        }


        startLightningAnimation();
    }

    function createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.textContent = '+1';
        effect.style.left = (x - 15) + 'px';
        effect.style.top = (y - 15) + 'px';

        document.body.appendChild(effect);

        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }

    function handleClickerClick(event) {

        const clickerScreen = document.getElementById('clickerScreen');
        if (!clickerScreen.classList.contains('active') || currentSlide !== 2) {
            return;
        }

        createClickEffect(event.clientX, event.clientY);

        clickCount++;
        updateClickCounter();

        if (clickCount % 8 === 0) {
            blinkCharacter();
        }
    }

    function updateClickCounter() {
        if (!clickerCounter) {
            clickerCounter = document.getElementById('clickerCounter');
        }

        if (clickerCounter) {
            clickerCounter.textContent = clickCount.toString().padStart(3, '0');

            checkUnlockedItems();
        }
    }

    function setMode(mode) {
        currentMode = mode;
        const clickerScreen = document.getElementById('clickerScreen');
        const shopScreen = document.getElementById('shopScreen');

        if (mode === 'clicker') {
            clickerScreen.classList.add('active');
            shopScreen.classList.remove('active');

            clickerScreen.style.display = 'block';
            shopScreen.style.display = 'none';

            if (clickButton) clickButton.style.opacity = '0.7';
            if (shopButton) shopButton.style.opacity = '1';

        } else if (mode === 'shop') {
            shopScreen.classList.add('active');
            clickerScreen.classList.remove('active');

            clickerScreen.style.display = 'none';
            shopScreen.style.display = 'block';

            if (clickButton) clickButton.style.opacity = '1';
            if (shopButton) shopButton.style.opacity = '0.7';
        }
    }

    function initShopItems() {
        console.log('Инициализация магазина...');

        checkUnlockedItems();

        const coinFrames = document.querySelectorAll('.shop-coin-frame');
        coinFrames.forEach((frame, index) => {
            frame.addEventListener('click', function () {
                buyItem(index + 1);
            });
        });
    }

    function checkUnlockedItems() {
        for (let i = 0; i < 5; i++) {
            const itemNumber = i + 1;
            if (clickCount >= itemPrices[i]) {
                unlockItem(itemNumber);

                // Проверяем, куплен ли предмет
                if (purchasedItems.includes(itemNumber)) {
                    const object = document.querySelector(`.object-${itemNumber}`);
                    if (object) object.style.opacity = '0.4';
                }
            }
        }
    }

    function unlockItem(itemNumber) {
        const question = document.querySelector(`.question-${itemNumber}`);
        const object = document.querySelector(`.object-${itemNumber}`);
        const priceText = document.querySelector(`.price-${itemNumber}`);

        if (question) question.style.opacity = '0';
        if (object) {
            if (purchasedItems.includes(itemNumber)) {
                object.style.opacity = '0.4';
            } else {
                object.style.opacity = '1';
            }
        }
    }

    function buyItem(itemNumber) {
        console.log(`Попытка покупки предмета ${itemNumber}`);
        const price = itemPrices[itemNumber - 1];
        const frame = document.querySelector(`.frame-${itemNumber}`);

    // Сбрасываем возможную предыдущую анимацию
    if (frame) {
        frame.style.animation = 'none';
        void frame.offsetWidth; // Принудительный reflow
    }

        // Проверяем, достаточно ли денег и не куплен ли уже предмет
        if (clickCount >= price && !purchasedItems.includes(itemNumber)) {
            clickCount -= price;
            updateClickCounter();

            // Добавляем в список купленных
            purchasedItems.push(itemNumber);

            // Показываем предмет на правой странице
            showPurchasedItem(itemNumber);
            const object = document.querySelector(`.object-${itemNumber}`);
            object.style.opacity = '0.4';

            console.log(`Куплен предмет ${itemNumber} за ${price} монет`);

            if (purchasedItems.length === 5) {
                console.log('Куплен последний предмет! Запускаем анимацию...');

                setMode('clicker');

                setTimeout(() => {
                    spawnHearts();
                }, 500);
            }
        } else if (purchasedItems.includes(itemNumber)) {
            console.log('Предмет уже куплен!');
            const frame = document.querySelector(`.frame-${itemNumber}`);
            frame.style.animation = 'shake 0.3s ease';
            setTimeout(() => {
                frame.style.animation = '';
            }, 300);
        } else {
            console.log('Недостаточно монет!');
            // Можно добавить анимацию "тряски"
            const frame = document.querySelector(`.frame-${itemNumber}`);
            frame.style.animation = 'shake 0.3s ease';
            setTimeout(() => {
                frame.style.animation = '';
            }, 300);
        }
    }

    function showPurchasedItem(itemNumber) {
        const purchasedItem = document.querySelector(`.purchased-item.item-${itemNumber}`);
        if (purchasedItem) {
            purchasedItem.classList.add('active');
        }
    }

    function blinkCharacter() {
        if (killua && killuaBlink) {
            killua.style.opacity = '1';
            killuaBlink.style.opacity = '1';

            if (blinkTimeout) {
                clearTimeout(blinkTimeout);
            }

            blinkTimeout = setTimeout(() => {
                killua.style.opacity = '1';
                killuaBlink.style.opacity = '0';
            }, 200);
        }
    }

    function startLightningAnimation() {
        if (lightningInterval) {
            clearInterval(lightningInterval);
        }

        lightnings.forEach(lightning => {
            if (lightning) lightning.style.opacity = '0';
        });

        animateLightningSequence();
    }

    function animateLightningSequence() {
        currentLightningIndex = 0;
        if (lightnings[0]) lightnings[0].style.opacity = '1';

        let sequenceInterval = setInterval(() => {
            if (lightnings[currentLightningIndex]) {
                lightnings[currentLightningIndex].style.opacity = '0';
            }

            currentLightningIndex++;

            if (currentLightningIndex >= lightnings.length) {
                clearInterval(sequenceInterval);

                lightningInterval = setTimeout(() => {
                    animateLightningSequence();
                }, 450);
                return;
            }

            if (lightnings[currentLightningIndex]) {
                lightnings[currentLightningIndex].style.opacity = '1';
            }
        }, 350);
    }

    function stopLightningAnimation() {
        if (lightningInterval) {
            clearTimeout(lightningInterval);
            lightningInterval = null;
        }

        lightnings.forEach(lightning => {
            if (lightning) lightning.style.opacity = '0';
        });
    }

    function spawnHearts() {
        const container = document.getElementById('hearts-animation-container');
        if (!container) return;

        container.innerHTML = '';

        const heartsConfig = [
            { x: 150, y: 200, size: 60 },
            { x: 230, y: 180, size: 70 },
            { x: 180, y: 220, size: 65 },
            { x: 250, y: 210, size: 75 }
        ];

        setTimeout(() => {
            heartsConfig.forEach((config, index) => {
                const heart = document.createElement('div');
                heart.classList.add('heart-anim');

                heart.style.width = config.size + 'px';
                heart.style.height = config.size + 'px';

                heart.style.left = config.x + 'px';
                heart.style.top = config.y + 'px';

                const finalX = (Math.random() - 0.5) * 40;
                const finalY = -120 - Math.random() * 30;

                heart.style.setProperty('--tx', finalX + 'px');
                heart.style.setProperty('--ty', finalY + 'px');

                container.appendChild(heart);

                setTimeout(() => {
                    heart.classList.add('heart-animation');

                    setTimeout(() => {
                        if (heart.parentNode === container) {
                            container.removeChild(heart);
                        }
                    }, 2000);
                }, index * 200);
            });
        }, 100);
    }
    function initNavigation() {
        arrowLeft.addEventListener('click', function (event) {
            event.stopPropagation();
            if (currentSlide > 0) {
                goToPreviousSlide();
            }
        });

        arrowRight.addEventListener('click', function (event) {
            event.stopPropagation();
            if (currentSlide < 4) {
                goToNextSlide();
            }
        });
    }

    function goToPreviousSlide() {
        if (currentSlide > 0) {
            changeSlide(currentSlide - 1);
        }
    }

    function goToNextSlide() {
        if (currentSlide < 4) {
            changeSlide(currentSlide + 1);
        }
    }

    function changeSlide(targetSlide) {
        console.log(`Переход с ${currentSlide} на ${targetSlide}`);

        if (currentSlide === targetSlide) return;

        // Блокируем кнопки на время перехода
        arrowLeft.style.pointerEvents = 'none';
        arrowRight.style.pointerEvents = 'none';

        // Затемнение экрана
        overlay.style.transition = 'opacity 0.8s ease, background-color 0.8s ease';
        overlay.style.backgroundColor = '#9FB3FF';
        overlay.style.opacity = '1';
        overlay.classList.add('active');

        setTimeout(() => {
            // Сбрасываем состояние текущего слайда
            resetSlideState(currentSlide);

            // Скрываем все слайды
            closedBook.style.opacity = '0';
            closedBook.style.pointerEvents = 'none';
            openBook.style.opacity = '0';
            openBook.style.pointerEvents = 'none';
            thirdSlide.style.opacity = '0';
            thirdSlide.style.pointerEvents = 'none';
            fourthSlide.style.opacity = '0';
            fourthSlide.style.pointerEvents = 'none';
            fifthSlide.style.opacity = '0';
            fifthSlide.style.pointerEvents = 'none';

            // Останавливаем все анимации текущего слайда
            if (currentSlide === 1) {
                stopPhotoSlideShow();
                stopTailWagging();
            } else if (currentSlide === 2) {
                stopLightningAnimation();
            }

            // Показываем целевой слайд
            setTimeout(() => {
                if (targetSlide === 0) {
                    closedBook.style.opacity = '1';
                    closedBook.style.pointerEvents = 'auto';
                    navigationArrows.classList.remove('visible');
                } else if (targetSlide === 1) {
                    openBook.style.opacity = '1';
                    openBook.style.pointerEvents = 'auto';
                    navigationArrows.classList.add('visible');
                    startPhotoSlideShow();
                    startTailWagging();
                    setTimeout(() => initMessages(), 100);
                } else if (targetSlide === 2) {
                    thirdSlide.style.opacity = '1';
                    thirdSlide.style.pointerEvents = 'auto';
                    navigationArrows.classList.add('visible');
                    initClickerGame();
                } else if (targetSlide === 3) {
                    fourthSlide.style.opacity = '1';
                    fourthSlide.style.pointerEvents = 'auto';
                    navigationArrows.classList.add('visible');
                    initVideo();
                } else if (targetSlide === 4) {
                    fifthSlide.style.opacity = '1';
                    fifthSlide.style.pointerEvents = 'auto';
                    navigationArrows.classList.add('visible');
                }

                currentSlide = targetSlide;
                updateArrowVisibility();

                // Осветление экрана
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';

                    setTimeout(() => {
                        overlay.classList.remove('active');
                        arrowLeft.style.pointerEvents = 'auto';
                        arrowRight.style.pointerEvents = 'auto';
                    }, 800);
                }, 800);
            }, 50);
        }, 800); // Ждем затемнения перед сменой слайдов
    }

    function forceShowSecondSlide() {
        // Скрываем все слайды
        closedBook.style.opacity = '0';
        closedBook.style.pointerEvents = 'none';
        openBook.style.opacity = '0';
        openBook.style.pointerEvents = 'none';
        thirdSlide.style.opacity = '0';
        thirdSlide.style.pointerEvents = 'none';

        // Показываем второй слайд
        openBook.style.opacity = '1';
        openBook.style.pointerEvents = 'auto';
        navigationArrows.classList.add('visible');
        startPhotoSlideShow();
        startTailWagging();
        initMessages();

        currentSlide = 1;
        updateArrowVisibility();
    }

    function updateArrowVisibility() {
        if (currentSlide === 0) {
            arrowLeft.style.opacity = '0';
            arrowRight.style.opacity = '0';
            arrowLeft.style.pointerEvents = 'none';
            arrowRight.style.pointerEvents = 'none';
        } else if (currentSlide === 4) {
            // Пятый слайд - показываем только левую стрелку
            arrowLeft.style.opacity = '1';
            arrowRight.style.opacity = '0';
            arrowLeft.style.pointerEvents = 'auto';
            arrowRight.style.pointerEvents = 'none';
        }
        else {
            arrowLeft.style.opacity = '1';
            arrowRight.style.opacity = '1';
            arrowLeft.style.pointerEvents = 'auto';
            arrowRight.style.pointerEvents = 'auto';

            // Затемняем стрелки когда нельзя перейти дальше
            arrowLeft.style.opacity = currentSlide === 0 ? '0.7' : '1';
            arrowRight.style.opacity = currentSlide === 4 ? '0.7' : '1';
        }
    }

    if (backgroundMusic) {
        backgroundMusic.volume = 0.05;
        document.addEventListener('click', function startMusicOnClick() {
            if (!musicStarted) {
                backgroundMusic.play().then(() => {
                    musicStarted = true;
                    document.removeEventListener('click', startMusicOnClick);
                }).catch(console.error);
            }
        });

        setTimeout(() => {
            if (!musicStarted) {
                backgroundMusic.play().catch(() => { });
            }
        }, 1000);
    }

    walkButton.addEventListener('click', function (event) {
        startCatAnimation();
        playMeowSound();
    });

    function startCatAnimation() {
        const catContainer = document.querySelector('.cat-container');
        catContainer.style.transform = 'translateX(0px)';
        catContainer.style.opacity = '1';
        catStand.style.opacity = '0';
        catWalk.style.opacity = '1';

        let position = 0;
        let isFirstImage = true;
        const animationSpeed = 19;
        const bookWidth = 500;

        if (catStepsSound) {
            playCatSteps();
        }

        const animationInterval = setInterval(function () {
            position += animationSpeed;
            catContainer.style.transform = `translateX(${position}px)`;

            if (isFirstImage) {
                catStand.style.opacity = '0';
                catWalk.style.opacity = '1';
            } else {
                catStand.style.opacity = '1';
                catWalk.style.opacity = '0';
            }
            isFirstImage = !isFirstImage;

            if (position > bookWidth) {
                clearInterval(animationInterval);
                stopCatSteps();
                changeSlide(1);
            }
        }, 150);
    }

    if (catStepsSound) {
        catStepsSound.volume = 0.07;
    }

    function playCatSteps() {
        if (catStepsSound) {
            catStepsSound.currentTime = 0;
            catStepsSound.play().catch(error => { });
        }
    }

    function stopCatSteps() {
        if (catStepsSound) {
            catStepsSound.pause();
        }
        if (stepsInterval) {
            clearInterval(stepsInterval);
            stepsInterval = null;
        }
    }

    function playMeowSound() {
        if (meowSound) {
            meowSound.volume = 0.05;
            meowSound.currentTime = 0;
            meowSound.play().catch(error => { });
        }
    }

    function startTailWagging() {
        const dogNormal = document.getElementById('dogNormal');
        const dogTail = document.getElementById('dogTail');
        let isNormal = true;

        if (tailWagInterval) {
            clearInterval(tailWagInterval);
        }

        tailWagInterval = setInterval(function () {
            if (isNormal) {
                dogNormal.style.opacity = '0';
                dogTail.style.opacity = '1';
            } else {
                dogNormal.style.opacity = '1';
                dogTail.style.opacity = '0';
            }
            isNormal = !isNormal;
        }, 250);
    }

    function stopTailWagging() {
        if (tailWagInterval) {
            clearInterval(tailWagInterval);
            tailWagInterval = null;
        }
        const dogNormal = document.getElementById('dogNormal');
        const dogTail = document.getElementById('dogTail');
        dogNormal.style.opacity = '1';
        dogTail.style.opacity = '0';
    }

    function initMessages() {
        const messageWrappers = document.querySelectorAll('.message-wrapper');
        messageWrappers.forEach(wrapper => {
            wrapper.onclick = function () {
                this.querySelector('.message-closed')?.classList.add('hidden');
            };
        });
    }

    function startPhotoSlideShow() {
        if (photoInterval) {
            clearInterval(photoInterval);
        }
        if (photos.length > 0) {
            photos.forEach(photo => photo.classList.remove('active'));
            photos[0].classList.add('active');
            currentPhotoIndex = 0;
        }
        photoInterval = setInterval(function () {
            changePhoto();
        }, 2000);
    }

    function stopPhotoSlideShow() {
        if (photoInterval) {
            clearInterval(photoInterval);
            photoInterval = null;
        }
    }

    function changePhoto() {
        photos[currentPhotoIndex].classList.remove('active');
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
        photos[currentPhotoIndex].classList.add('active');
    }

    function forceArrowEvents() {
        arrowLeft.style.pointerEvents = 'auto';
        arrowRight.style.pointerEvents = 'auto';
        arrowLeft.style.zIndex = '1000';
        arrowRight.style.zIndex = '1000';
    }

    setTimeout(forceArrowEvents, 1000);

    function resetSlideState(slideNumber) {
        switch (slideNumber) {
            case 0:
                const catContainer = document.querySelector('.cat-container');

                catContainer.style.transform = 'translateX(0px)';
                catContainer.style.transition = 'none';
                catContainer.style.opacity = '1';

                catStand.style.opacity = '1';
                catWalk.style.opacity = '0';

                walkButton.onclick = function (event) {
                    startCatAnimation();
                    playMeowSound();
                };

                walkButton.style.opacity = '1';
                walkButton.style.pointerEvents = 'auto';
                okText.style.pointerEvents = 'none';


                walkButton.style.zIndex = '20';
                break;

            case 1:
                if (photos.length > 0) {
                    photos.forEach(photo => photo.classList.remove('active'));
                    photos[0].classList.add('active');
                    currentPhotoIndex = 0;
                }

                const messageClosed = document.querySelectorAll('.message-closed');
                messageClosed.forEach(msg => {
                    msg.classList.remove('hidden');
                });

                const dogNormal = document.getElementById('dogNormal');
                const dogTail = document.getElementById('dogTail');
                if (dogNormal && dogTail) {
                    dogNormal.style.opacity = '1';
                    dogTail.style.opacity = '0';
                }
                break;

            case 2:
                clickCount = 0;
                updateClickCounter();

                purchasedItems = [];

                const purchasedItemsElements = document.querySelectorAll('.purchased-item');
                purchasedItemsElements.forEach(item => {
                    item.classList.remove('active');
                });

                // Сбрасываем видимость вопросов и объектов
                const questions = document.querySelectorAll('.shop-question');
                const objects = document.querySelectorAll('.shop-object-img');

                questions.forEach(q => q.style.opacity = '1');
                objects.forEach(o => {
                    o.style.opacity = '0';
                });

                            const frames = document.querySelectorAll('.shop-coin-frame');
            frames.forEach(frame => {
                frame.style.animation = 'none'; // Принудительно сбрасываем анимацию
                // Принудительный reflow для сброса анимации
                void frame.offsetWidth;
            });


                // Сбрасываем анимацию моргания
                if (killua && killuaBlink) {
                    killua.style.opacity = '1';
                    killuaBlink.style.opacity = '0';
                }
                if (blinkTimeout) {
                    clearTimeout(blinkTimeout);
                    blinkTimeout = null;
                }

                // Сбрасываем режим на кликер
                currentMode = 'clicker';
                const clickerScreen = document.getElementById('clickerScreen');
                const shopScreen = document.getElementById('shopScreen');
                if (clickerScreen && shopScreen) {
                    clickerScreen.classList.add('active');
                    shopScreen.classList.remove('active');
                }

                // Сбрасываем кнопки
                if (clickButton) clickButton.style.opacity = '0.7';
                if (shopButton) shopButton.style.opacity = '1';

                stopLightningAnimation();
                break;
            case 3:
                if (birthdayVideo) {
                    birthdayVideo.pause();
                    birthdayVideo.currentTime = 0;
                }
                if (playButton) {
                    playButton.style.display = 'block';
                }
                break;
            case 4:
                break;
        }
    }

    setTimeout(() => {
        setInterval(() => {
            if (overlay.classList.contains('active') &&
                overlay.style.opacity === '1' &&
                Date.now() - lastTransitionTime > 3000) {
                console.log('Восстанавливаем интерфейс после застревания');
                overlay.style.opacity = '0';
                overlay.classList.remove('active');
                arrowLeft.style.pointerEvents = 'auto';
                arrowRight.style.pointerEvents = 'auto';

                if (currentSlide === 1) {
                    forceShowSecondSlide();
                }
            }
        }, 1000);
    }, 5000);
});