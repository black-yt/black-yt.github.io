# <i class="fas fa-pen-nib section-icon"></i> Blogs

{% assign blog_posts = site.blogs | where: "lang", "en" | sort: "date" | reverse %}
<div class="blog-list">
{% for post in blog_posts %}
  <div class="blog-entry">
    {% if post.cover %}
      <a class="blog-entry__cover image-popup" href="{{ post.cover | relative_url }}" target="_self" aria-label="Enlarge image: {{ post.title | escape }}">
        <img class="blog-entry__image" src="{{ post.cover | relative_url }}" alt="" loading="lazy">
      </a>
    {% else %}
      <span class="blog-entry__placeholder" aria-hidden="true"><i class="fas fa-pen-nib"></i></span>
    {% endif %}
    <span class="blog-entry__text">
      <a class="blog-entry__title" href="{{ post.url | relative_url }}" target="_self">{{ post.title | escape }}</a>
      <time class="blog-entry__date" datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: "%Y-%m-%d" }}</time>
    </span>
  </div>
{% endfor %}
</div>
