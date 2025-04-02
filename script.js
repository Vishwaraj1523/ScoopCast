const API_KEY = '1b643dd1676f4a1c0731b64707f58936';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Add these variables at the top
let currentPage = 1;
let currentQuery = '';
let movieResults = [];
let showResults = [];

// Function to fetch trending movies
async function getTrendingMovies() {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
}

// Function to fetch trending TV shows
async function getTrendingShows() {
    try {
        const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending shows:', error);
        return [];
    }
}

// Function to search movies and shows
async function searchContent(query, page = 1) {
    try {
        const movieResponse = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
        );
        const showResponse = await fetch(
            `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
        );
        
        const movieData = await movieResponse.json();
        const showData = await showResponse.json();
        
        return {
            movies: movieData.results,
            shows: showData.results,
            totalMoviePages: movieData.total_pages,
            totalShowPages: showData.total_pages
        };
    } catch (error) {
        console.error('Error searching content:', error);
        return { movies: [], shows: [], totalMoviePages: 0, totalShowPages: 0 };
    }
}

// Add this function to get the number of items based on screen width
function getItemsPerRow() {
    const width = window.innerWidth;
    if (width > 1400) return 7;
    if (width > 1200) return 6;
    if (width > 992) return 5;
    if (width > 768) return 4;
    if (width > 576) return 3;
    return 2;
}

// Function to display search results
function displaySearchResults(results, isLoadMore = false) {
    const movieContainer = document.getElementById('movie-results');
    const showContainer = document.getElementById('show-results');
    const noResults = document.getElementById('no-results');
    const searchQueryDiv = document.getElementById('search-query');
    const loadMoreMovies = document.getElementById('load-more-movies');
    const loadMoreShows = document.getElementById('load-more-shows');
    
    if (!movieContainer || !showContainer) return;

    if (!isLoadMore) {
        movieResults = results.movies;
        showResults = results.shows;
        searchQueryDiv.textContent = `Results for: "${currentQuery}"`;
    } else {
        movieResults = [...movieResults, ...results.movies];
        showResults = [...showResults, ...results.shows];
    }

    if (movieResults.length === 0 && showResults.length === 0) {
        movieContainer.style.display = 'none';
        showContainer.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    const itemsPerRow = getItemsPerRow();
    
    if (movieResults.length > 0) {
        movieContainer.style.display = 'flex';
        movieContainer.innerHTML = movieResults.slice(0, itemsPerRow).map(movie => `
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'pop/placeholder.jpeg'}" 
                 alt="${movie.title}"
                 onclick="showDetails('movie', ${movie.id})"
                 style="cursor: pointer;">
        `).join('');
        loadMoreMovies.style.display = currentPage < results.totalMoviePages ? 'block' : 'none';
    }

    if (showResults.length > 0) {
        showContainer.style.display = 'flex';
        showContainer.innerHTML = showResults.slice(0, itemsPerRow).map(show => `
            <img src="${show.poster_path ? IMAGE_BASE_URL + show.poster_path : 'pop/placeholder.jpeg'}" 
                 alt="${show.name}"
                 onclick="showDetails('tv', ${show.id})"
                 style="cursor: pointer;">
        `).join('');
        loadMoreShows.style.display = currentPage < results.totalShowPages ? 'block' : 'none';
    }
}

// Function to display movies/shows in a container
function displayContent(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const itemsPerRow = getItemsPerRow();
    const itemsToShow = items.slice(0, itemsPerRow);
    
    container.innerHTML = itemsToShow.map(item => {
        const mediaType = containerId.includes('movies') ? 'movie' : 'tv';
        return `
            <img src="${IMAGE_BASE_URL}${item.poster_path}" 
                 alt="${item.title || item.name}"
                 onclick="showDetails('${mediaType}', ${item.id})"
                 style="cursor: pointer;">
        `;
    }).join('');
}

// Function to show details when clicking on a movie/show
async function showDetails(mediaType, id) {
    try {
        const response = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}`);
        const data = await response.json();
        window.location.href = `detail.html?id=${id}&type=${mediaType}`;
    } catch (error) {
        console.error('Error fetching details:', error);
    }
}

// Add these new functions for loading more results
async function loadMoreMovies() {
    currentPage++;
    const results = await searchContent(currentQuery, currentPage);
    displaySearchResults(results, true);
}
async function loadMoreShows() {
    currentPage++;
    const results = await searchContent(currentQuery, currentPage);
    displaySearchResults(results, true);
}

// Add new functions to fetch popular content
async function getPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
}

async function getPopularShows() {
    try {
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching popular shows:', error);
        return [];
    }
}

// Update the initializePage function
async function initializePage() {
    const currentPath = window.location.pathname.split('/').pop();

    if (currentPath === 'search.html') {
        const urlParams = new URLSearchParams(window.location.search);
        currentQuery = urlParams.get('query');
        
        if (currentQuery) {
            const results = await searchContent(currentQuery);
            displaySearchResults(results);
        }
        return;
    }

    const trendingMovies = await getTrendingMovies();
    const trendingShows = await getTrendingShows();
    const popularMovies = await getPopularMovies();
    const popularShows = await getPopularShows();
    const itemsPerRow = getItemsPerRow();
    
    if (currentPath === 'index.html' || currentPath === '') {
        // Latest section (trending)
        displayContent(trendingMovies.slice(0, itemsPerRow), 'latest-movies');
        displayContent(trendingShows.slice(0, itemsPerRow), 'latest-shows');
        
        // Popular this week section
        displayContent(popularMovies.slice(0, itemsPerRow), 'popular-movies');
        displayContent(popularShows.slice(0, itemsPerRow), 'popular-shows');
    } 
    else if (currentPath === 'movies.html') {
        // Latest movies section
        displayContent(trendingMovies.slice(0, itemsPerRow), 'latest-movies');
        displayContent(trendingMovies.slice(itemsPerRow, itemsPerRow * 2), 'latest-movies-2');
        displayContent(trendingMovies.slice(itemsPerRow * 2, itemsPerRow * 3), 'latest-movies-3');
        
        // Popular movies section
        displayContent(popularMovies.slice(0, itemsPerRow), 'popular-movies');
        displayContent(popularMovies.slice(itemsPerRow, itemsPerRow * 2), 'popular-movies-2');
        displayContent(popularMovies.slice(itemsPerRow * 2, itemsPerRow * 3), 'popular-movies-3');
    }
    else if (currentPath === 'shows.html') {
        // Latest shows section
        displayContent(trendingShows.slice(0, itemsPerRow), 'latest-shows');
        displayContent(trendingShows.slice(itemsPerRow, itemsPerRow * 2), 'latest-shows-2');
        displayContent(trendingShows.slice(itemsPerRow * 2, itemsPerRow * 3), 'latest-shows-3');
        
        // Popular shows section
        displayContent(popularShows.slice(0, itemsPerRow), 'popular-shows');
        displayContent(popularShows.slice(itemsPerRow, itemsPerRow * 2), 'popular-shows-2');
        displayContent(popularShows.slice(itemsPerRow * 2, itemsPerRow * 3), 'popular-shows-3');
    }
}

// Call initializePage when the document is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Add window resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initializePage();
    }, 250);
}); 


// Modify script.js to implement the new rating system and update detail.html

document.addEventListener("DOMContentLoaded", function () {
    loadDetails();
});

async function loadDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');

    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
        const data = await response.json();

        document.querySelector('.info img').src = `${IMAGE_BASE_URL}${data.poster_path}`;
        document.querySelector('.detail-title').textContent = data.title || data.name;
        document.querySelector('.about p').textContent = data.overview;

        // Add genre ratings
        const genreContainer = document.getElementById('genre-ratings-container');
        genreContainer.innerHTML = ''; // Clear existing content

        data.genres.forEach(genre => {
            const ratingDiv = document.createElement('div');
            ratingDiv.className = 'genre-rating-item';
            ratingDiv.innerHTML = `
                <label>${genre.name}:</label>
                <select class="genre-rating" data-genre="${genre.id}">
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            `;
            genreContainer.appendChild(ratingDiv);
        });

        // Add event listeners to all genre rating selects
        document.querySelectorAll('.genre-rating').forEach(select => {
            select.addEventListener('change', calculateFinalGrade);
        });

        // Add review form handler
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const reviewText = document.getElementById('review-text').value;
                const finalGrade = document.getElementById('final-grade').textContent;
                
                // Save to diary
                saveReview(
                    id,
                    data.title || data.name,
                    `${IMAGE_BASE_URL}${data.poster_path}`,
                    finalGrade,
                    reviewText
                );
                
                alert('Review saved to your diary!');
                reviewForm.reset();
            });
        }

    } catch (error) {
        console.error('Error loading details:', error);
    }
}

function calculateFinalGrade() {
    const ratings = document.querySelectorAll('.genre-rating');
    let totalScore = 0;
    let count = 0;

    ratings.forEach(select => {
        if (select.value) {
            const grade = select.value;
            let score;
            switch (grade) {
                case 'A+': score = 10; break;
                case 'A': score = 9; break;
                case 'B+': score = 8; break;
                case 'B': score = 7; break;
                case 'C': score = 6; break;
                case 'D': score = 5; break;
            }
            totalScore += score;
            count++;
        }
    });

    if (count > 0) {
        const averageScore = totalScore / count;
        let finalGrade;
        if (averageScore >= 9.5) finalGrade = 'A+';
        else if (averageScore >= 9) finalGrade = 'A';
        else if (averageScore >= 8) finalGrade = 'B+';
        else if (averageScore >= 7) finalGrade = 'B';
        else if (averageScore >= 6) finalGrade = 'C';
        else finalGrade = 'D';

        document.getElementById('final-grade').textContent = `Final Grade: ${finalGrade}`;
    }
}

// Diary functionality
function saveReview(movieId, title, posterPath, rating, reviewText) {
    const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    const newReview = {
        id: movieId,
        title: title,
        posterPath: posterPath,
        rating: rating,
        reviewText: reviewText,
        date: new Date().toISOString()
    };
    reviews.push(newReview);
    localStorage.setItem('userReviews', JSON.stringify(reviews));
}

function displayReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;

    const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="empty-reviews">No reviews yet. Start reviewing movies and shows!</div>';
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-card">
            <img src="${review.posterPath}" alt="${review.title}">
            <h3>${review.title}</h3>
            <div class="rating">${review.rating}</div>
            <p class="review-text">${review.reviewText}</p>
            <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// Add review form to detail page
function addReviewForm() {
    const detailContainer = document.querySelector('.detail-container');
    if (!detailContainer) return;

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';
    reviewSection.innerHTML = `
        <h3 style="color: white; margin-top: 20px;">Write a Review</h3>
        <form id="review-form" style="margin-top: 10px;">
            <div style="margin-bottom: 10px;">
                <label style="color: white; margin-right: 10px;">Rating:</label>
                <select id="rating" required>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>
            <textarea id="review-text" placeholder="Write your review here..." required 
                style="width: 100%; padding: 10px; margin-bottom: 10px; background: rgba(255,255,255,0.1); 
                border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px;"></textarea>
            <button type="submit" style="padding: 8px 16px; background: #007bff; color: white; 
                border: none; border-radius: 5px; cursor: pointer;">Submit Review</button>
        </form>
    `;

    detailContainer.appendChild(reviewSection);

    const form = document.getElementById('review-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rating = parseInt(document.getElementById('rating').value);
        const reviewText = document.getElementById('review-text').value;
        const movieId = new URLSearchParams(window.location.search).get('id');
        const title = document.querySelector('.detail-title')?.textContent || '';
        const posterPath = document.querySelector('.detail-poster img')?.src || '';

        saveReview(movieId, title, posterPath, rating, reviewText);
        alert('Review saved successfully!');
        form.reset();
    });
}

// Initialize diary functionality
document.addEventListener('DOMContentLoaded', () => {
    displayReviews();
    addReviewForm();

    // Add reset functionality
    const resetButton = document.getElementById('reset-reviews');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all your reviews? This action cannot be undone.')) {
                localStorage.removeItem('userReviews');
                displayReviews();
                alert('All reviews have been deleted.');
            }
        });
    }
});
