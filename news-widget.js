document.addEventListener('DOMContentLoaded', function () {
    const baseUrl = 'https://www.tradepr.work/articles/';

    // Fetch and display news articles
    fetch(baseUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const articles = doc.querySelectorAll('.row-fluid.search_result');
            const widget = document.getElementById('news-widget');

            if (articles.length === 0) {
                widget.innerHTML = '<p>No news items found.</p>';
            } else {
                articles.forEach(article => {
                    const titleElement = article.querySelector('.h3.bold.bmargin.center-block');
                    const title = titleElement ? titleElement.textContent.trim() : 'No title available';
                    const link = titleElement ? titleElement.closest('a').href : '#';
                    const descriptionElement = article.querySelector('.xs-nomargin');
                    const description = descriptionElement ? descriptionElement.textContent.trim() : 'No description available';
                    const imgElement = article.querySelector('.alert-secondary img');
                    const imgSrc = imgElement ? `https://www.tradepr.work${imgElement.src}` : '';

                    // Replace the domain in the link to ensure it's correct
                    const correctedLink = link.replace('https://emilliohezekiah.github.io', 'https://www.tradepr.work');

                    widget.innerHTML += `
                        <div class="news-item">
                            ${imgSrc ? `<img src="${imgSrc}" alt="${title}">` : ''}
                            <div>
                                <a href="#" class="news-link" data-url="${encodeURIComponent(correctedLink)}">${title}</a>
                                <p>${description}</p>
                            </div>
                        </div>
                    `;
                });
            }
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
        console.log('Fetching news content from URL:', url);
        fetch(url)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');

                // Update these selectors based on actual HTML structure
                const title = doc.querySelector('h1.bold.h2.nobmargin') ? doc.querySelector('h1.bold.h2.nobmargin').textContent : 'No Title';
                const image = doc.querySelector('.alert-secondary img') ? `https://www.tradepr.work${doc.querySelector('.alert-secondary img').src}` : '';
                const content = doc.querySelector('.the-post-description') ? doc.querySelector('.the-post-description').innerHTML : 'No Content Available';

                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <h1>${title}</h1>
                    ${image ? `<img src="${image}" alt="${title}">` : ''}
                    <div>${content}</div>
                `;
                document.getElementById('newsModal').style.display = 'block';
            })
            .catch(error => console.error('Error loading news content:', error));
    }

    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('newsModal').style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target === document.getElementById('newsModal')) {
            document.getElementById('newsModal').style.display = 'none';
        }
    }
});
