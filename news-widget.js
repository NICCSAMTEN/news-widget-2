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
                    const link = titleElement ? titleElement.href : '#';
                    const descriptionElement = article.querySelector('.xs-nomargin');
                    const description = descriptionElement ? descriptionElement.textContent.trim() : 'No description available';
                    const imgElement = article.querySelector('.img_section img');
                    const imgSrc = imgElement ? `https://www.tradepr.work${imgElement.src}` : '';

                    widget.innerHTML += `
                        <div class="news-item">
                            ${imgSrc ? `<img src="${imgSrc}" alt="${title}">` : ''}
                            <a href="#" class="news-link" data-url="${encodeURIComponent(link)}">${title}</a>
                            <p>${description}</p>
                        </div>
                    `;
                });
            }
        })
        .catch(error => console.error('Error loading news:', error));

    // Handle clicks on news links
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
                const title = doc.querySelector('.col-md-12.tmargin h1.bold.h2.nobmargin') 
                    ? doc.querySelector('.col-md-12.tmargin h1.bold.h2.nobmargin').textContent 
                    : 'No Title';
                const image = doc.querySelector('.img_section img') 
                    ? `https://www.tradepr.work${doc.querySelector('.img_section img').src}` 
                    : '';
                const content = doc.querySelector('.the-post-description p#isPasted') 
                    ? doc.querySelector('.the-post-description p#isPasted').innerHTML 
                    : 'No Content Available';

                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <h1>${title}</h1>
                    ${image ? `<img src="${image}" alt="${title}" style="max-width: 100%;">` : ''}
                    <div>${content}</div>
                `;
                document.getElementById('newsModal').style.display = 'block';
            })
            .catch(error => console.error('Error loading news content:', error));
    }

    // Close the modal
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('newsModal').style.display = 'none';
    });

    // Close the modal if the user clicks outside of it
    window.onclick = function(event) {
        if (event.target === document.getElementById('newsModal')) {
            document.getElementById('newsModal').style.display = 'none';
        }
    }
});
