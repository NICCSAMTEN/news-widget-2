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
                    const imgElement = article.querySelector('.img_section img');

                    let imgSrc = '';
                    if (imgElement) {
                        imgSrc = imgElement.src;

                        // Correct the image URL to always use the tradepr.work domain
                        if (imgSrc.startsWith('/')) {
                            imgSrc = `https://www.tradepr.work${imgSrc}`;
                        } else if (!imgSrc.startsWith('http')) {
                            imgSrc = `https://www.tradepr.work/uploads/news-pictures-thumbnails/${imgSrc}`;
                        } else if (imgSrc.startsWith('https://emilliohezekiah.github.io')) {
                            imgSrc = imgSrc.replace('https://emilliohezekiah.github.io', 'https://www.tradepr.work');
                        }
                    }

                    // Replace the domain in the link to ensure it's correct
                    const correctedLink = link.replace('https://emilliohezekiah.github.io', 'https://www.tradepr.work');

                    widget.innerHTML += `
                        <div class="news-item">
                            ${imgSrc ? `<img src="${imgSrc}" alt="${title}" class="news-image">` : ''}
                            <div class="news-content">
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

                // Extract the title
                const title = doc.querySelector('h1.bold.h2.nobmargin') ? doc.querySelector('h1.bold.h2.nobmargin').textContent.trim() : 'No Title';

                // Extract the image
                const imageElement = doc.querySelector('.img_section img');
                let image = '';
                if (imageElement) {
                    image = imageElement.src.startsWith('http') ? imageElement.src : `https://www.tradepr.work${imageElement.src}`;
                }

                // Extract the full content from .the-post-description
                const contentContainer = doc.querySelector('.the-post-description');
                let content = 'No Content Available';
                if (contentContainer) {
                    content = contentContainer.innerHTML.trim();
                }

                // Debug output
                console.log('Title:', title);
                console.log('Image:', image);
                console.log('Content:', content);

                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <h1>${title}</h1>
                    ${image ? `<img src="${image}" alt="${title}" class="modal-image">` : ''}
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
