document.addEventListener('DOMContentLoaded', function () {
    const baseUrl = 'https://www.tradepr.work/articles/';

    function correctImageUrl(src) {
        if (src.startsWith('/')) {
            return `https://www.tradepr.work${src}`;
        } else if (!src.startsWith('http')) {
            return `https://www.tradepr.work/uploads/news-pictures-thumbnails/${src}`;
        } else {
            return src.replace(/https:\/\/emilliohezekiah.github.io/, 'https://www.tradepr.work');
        }
    }

    function shouldExcludeImage(src) {
        return src.includes('/pictures/profile/');
    }

    function cleanDescription(description) {
        return description.replace(/View More/gi, '').trim();
    }

    function formatPostedMetaData(date, author) {
        return `
            <div class="posted-meta-data">
                <span class="posted-by-snippet-posted">Posted</span>
                <span class="posted-by-snippet-date">${date}</span>
                <span class="posted-by-snippet-author">by ${author}</span>
            </div>
        `;
    }

    function extractPostedMetaData(element) {
        const postedMetaData = element ? element.textContent.trim() : '';
        let postedDate = 'No Date';
        let postedAuthor = 'No Author';

        const dateMatch = postedMetaData.match(/Posted\s+(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) {
            postedDate = dateMatch[1];
        }

        const authorMatch = postedMetaData.match(/by\s+(.+?)(\s+in\s+[\w\s]+)?$/);
        if (authorMatch) {
            postedAuthor = authorMatch[1].replace(/<\/?a[^>]*>/g, '').trim();
        }

        return { postedDate, postedAuthor };
    }

    function disableBackgroundScroll() {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
    }

    function enableBackgroundScroll() {
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    }

    function setContentEditableToFalse() {
        const elements = document.querySelectorAll('.fr-inner');
        elements.forEach(element => {
            element.setAttribute('contenteditable', 'false');
        });

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'contenteditable') {
                    const target = mutation.target;
                    if (target.classList.contains('fr-inner') && target.getAttribute('contenteditable') === 'true') {
                        target.setAttribute('contenteditable', 'false');
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['contenteditable']
        });
    }

    fetch(baseUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const articles = doc.querySelectorAll('.row-fluid.search_result');
            const widget = document.getElementById('news-widget');

            widget.innerHTML = `
                <div style="text-align: left;">
                    <img src="https://github.com/EmillioHezekiah/news-widget-2/blob/18d2e9e6bacf0775095d6e1f8c5a81d051cb4bac/trade2372.png?raw=true" 
                         alt="PR News Logo" 
                         class="news-custom-image">
                    <h2>News from Trade PR</h2>
                </div>
            `;

            if (articles.length === 0) {
                widget.innerHTML += '<p>No news items found.</p>';
            } else {
                articles.forEach(article => {
                    const titleElement = article.querySelector('.h3.bold.bmargin.center-block');
                    const title = titleElement ? titleElement.textContent.trim() : 'No title available';
                    const link = titleElement ? titleElement.closest('a').href : '#';
                    const descriptionElement = article.querySelector('.xs-nomargin');
                    let description = descriptionElement ? descriptionElement.textContent.trim() : 'No description available';
                    description = cleanDescription(description);
                    const imgElement = article.querySelector('.img_section img');

                    let imgSrc = '';
                    if (imgElement) {
                        imgSrc = correctImageUrl(imgElement.src);
                        if (shouldExcludeImage(imgSrc)) {
                            imgSrc = '';
                        }
                    }

                    const correctedLink = link.replace(/https:\/\/emilliohezekiah.github.io/, 'https://www.tradepr.work');

                    const postedMetaDataElement = article.querySelector('.posted_meta_data');
                    const { postedDate, postedAuthor } = extractPostedMetaData(postedMetaDataElement);

                    widget.innerHTML += `
                        <div class="news-item">
                            ${imgSrc ? `<img src="${imgSrc}" alt="${title}" class="news-image">` : ''}
                            <div class="news-content">
                                <a href="#" class="news-link" data-url="${encodeURIComponent(correctedLink)}">${title}</a>
                                <p>${description}</p>
                                ${formatPostedMetaData(postedDate, postedAuthor)}
                            </div>
                        </div>
                    `;
                });
            }

            setContentEditableToFalse();
        })
        .catch(error => console.error('Error loading news:', error));

    document.addEventListener('click', function(event) {
        if (event.target.matches('.news-link')) {
            event.preventDefault();
            const newsUrl = decodeURIComponent(event.target.getAttribute('data-url'));
            loadNewsContent(newsUrl);
        }
    });

    function loadNewsContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');

                const title = doc.querySelector('h1.bold.h2.nobmargin') ? doc.querySelector('h1.bold.h2.nobmargin').textContent.trim() : 'No Title';
                const imageElement = doc.querySelector('.img_section img');
                let image = '';
                if (imageElement) {
                    image = correctImageUrl(imageElement.src);
                    if (shouldExcludeImage(image)) {
                        image = '';
                    }
                }

                const contentContainer = doc.querySelector('.the-post-description');
                let content = 'No Content Available';
                if (contentContainer) {
                    content = contentContainer.innerHTML.trim();
                }

                const postedMetaDataElement = doc.querySelector('.posted_meta_data');
                const { postedDate, postedAuthor } = extractPostedMetaData(postedMetaDataElement);

                const additionalImageElement = doc.querySelector('img.center-block');
                let additionalImage = '';
                if (additionalImageElement) {
                    additionalImage = correctImageUrl(additionalImageElement.src);
                    if (shouldExcludeImage(additionalImage)) {
                        additionalImage = '';
                    }
                }

                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <h1>${title}</h1>
                    ${additionalImage ? `<img src="${additionalImage}" alt="${title}" class="modal-thumbnail">` : ''}
                    ${image ? `<img src="${image}" alt="${title}" class="modal-image">` : ''}
                    <div>${content}</div>
                `;

                const modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.scrollTop = 0;
                }

                disableBackgroundScroll();
                document.getElementById('newsModal').style.display = 'block';
            })
            .catch(error => console.error('Error loading news content:', error));
    }

    document.querySelector('.close').addEventListener('click', function() {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        enableBackgroundScroll();
        document.getElementById('newsModal').style.display = 'none';
    });
});
