document.addEventListener('DOMContentLoaded', function() {
    const baseUrl = 'https://www.tradepr.work/articles/';

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
                            <a href="#" class="news-link" data-url="${link}">${title}</a>
                            <p>${description}</p>
                        </div>
                    `;
                });
            }
        })
        .catch(error => console.error('Error loading news:', error));

    document.addEventListener('click', function(event) {
        if (event.target.matches('.news-link')) {
            event.preventDefault();
            const newsUrl = event.target.getAttribute('data-url');
            console.log('Fetching news content from URL:', newsUrl); // Debugging line
            loadNewsContent(newsUrl);
        } else if (event.target.matches('.close')) {
            document.getElementById('newsModal').style.display = 'none';
        }
    });

    function loadNewsContent(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                console.log('Loaded document:', doc); // Debugging line
                const title = doc.querySelector('.col-md-12.tmargin h1.bold.h2.nobmargin') 
                    ? doc.querySelector('.col-md-12.tmargin h1.bold.h2.nobmargin').textContent 
                    : 'No Title';
                const content = doc.querySelector('.the-post-description p#isPasted') 
                    ? doc.querySelector('.the-post-description p#isPasted').innerHTML 
                    : 'No Content Available';
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <h1>${title}</h1>
                    <div>${content}</div>
                `;
                document.getElementById('newsModal').style.display = 'block';
            })
            .catch(error => console.error('Error loading news content:', error));
    }
});
