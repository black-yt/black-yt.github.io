# <i class="fas fa-pen-nib section-icon"></i> Blogs

{% assign blog_posts = site.blogs | where: "lang", "en" | sort: "date" | reverse %}
<div class="blog-list">
{% for post in blog_posts %}
  <a class="blog-entry" href="{{ post.url | relative_url }}" target="_self">
    {% if post.cover %}
      <img class="blog-entry__image" src="{{ post.cover | relative_url }}" alt="" loading="lazy">
    {% else %}
      <span class="blog-entry__placeholder" aria-hidden="true"><i class="fas fa-pen-nib"></i></span>
    {% endif %}
    <span class="blog-entry__text">
      <span class="blog-entry__title">{{ post.title | escape }}</span>
      <time class="blog-entry__date" datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: "%Y-%m-%d" }}</time>
    </span>
  </a>
{% endfor %}
</div>
