# <i class="fas fa-pen-nib section-icon"></i> Blogs

{% assign blog_posts = site.blogs | where: "lang", "en" | sort: "date" | reverse %}
{% for post in blog_posts %}
- <a href="{{ post.url | relative_url }}" target="_self">{{ post.title | escape }}</a>

{% endfor %}
