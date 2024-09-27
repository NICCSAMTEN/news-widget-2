document.addEventListener('DOMContentLoaded', function () {
    const baseUrl = 'https://www.tradepr.work/articles/';

    // Ensure image URLs are always prefixed with the correct domain
    function correctImageUrl(src) {
        if (src.startsWith('/')) {
            // If the src starts with `/`, we assume it's relative to the domain
            return `https://www.tradepr.work${src}`;
        } else if (!src.startsWith('http')) {
            // If the src doesn't start with http, it's likely a file name
            return `https://www.tradepr.work/uploads/news-pictures-thumbnails/${src}`;
        } else {
            // If it already has a valid http(s) prefix, return it as is
            return src;
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

                    // Ensure both title and link are present
                    const title = titleElement ? titleElement.textContent.trim() : 'No title available';
                    let link = linkElement ? linkElement.href : null;

                    // If the link is null or invalid, ensure a fallback URL
                    if (!link || link === '#') {
                        console.warn(`Invalid link for article titled: ${title}. Using base URL.`);
                        link = baseUrl;  // Default to base URL if the link is invalid
                    }

                    const descriptionElement = article.querySelector('.xs-nomargin');
                    let description = descriptionElement ? descriptionElement.textContent.trim() : 'No description available';
                    description = cleanDescription(description);

                    const imgElement = article.querySelector('.img_section img');
                    let imgSrc = '';
                    if (imgElement) {
                        imgSrc = correctImageUrl(imgElement.src); // Ensure the correct URL is set
                        if (shouldExcludeImage(imgSrc)) {
                            imgSrc = '';  // Exclude image if necessary
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
