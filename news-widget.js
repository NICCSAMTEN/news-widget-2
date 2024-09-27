document.addEventListener('DOMContentLoaded', function () {
    const baseUrl = 'https://www.tradepr.work/articles/';

    function correctImageUrl(src) {
        if (src.startsWith('/')) {
            return `https://www.tradepr.work${src}`;
        } else if (!src.startsWith('http')) {
            return `https://www.tradepr.work/uploads/news-pictures-thumbnails/${src}`;
        } else {
            return src;  // No need to replace as we no longer use GitHub URLs.
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

    // Fetch data from TradePR articles page
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
                    const linkElement = article.querySelector('a');

                    const title = titleElement ? titleElement.textContent.trim() : 'No title available';
                    let link = linkElement ? linkElement.href : null;

                    // Ensure that the link is valid, otherwise use the base URL
                    if (!link || link === '#') {
                        link = baseUrl;  // Default to base URL if link is invalid
                    }

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

                    const postedMetaDataElement = article.querySelector('.posted_meta_data');
                    const { postedDate, postedAuthor } = extractPostedMetaData(postedMetaDataElement);

                    // Add a link to the full article page
                    widget.innerHTML += `
                        <div class="news-item">
                            ${imgSrc ? `<img src="${imgSrc}" alt="${title}" class="news-image">` : ''}
                            <div class="news-content">
                                <a href="news-details.html?articleUrl=${encodeURIComponent(link)}" class="news-link">${title}</a>
                                <p>${description}</p>
                                ${formatPostedMetaData(postedDate, postedAuthor)}
                            </div>
                        </div>
                    `;
                });
            }
        })
        .catch(error => console.error('Error loading news:', error));
});
