# 🔥 News

{% capture news_items %}
- *2025.12*: Our large-scale benchmark *[SGI-Bench](https://internscience.github.io/SGI-Page/)* is released 👏 —— a **<span class="highlight-red">150+</span>** page comprehensive report co-authored by **<span class="highlight-red">100+</span>** researchers, providing the most extensive evaluation to date of LLMs and Agents on **deep research**, **idea generation**, **code generation**, **multimodal reasoning**, and more. *[SGI-Bench](https://internscience.github.io/SGI-Page/)* offers a unified and rigorous framework for measuring AI systems’ automated research capabilities, marking a major milestone toward building truly automated research agents.

- *2025.10*: Our new paper on multi-agent reasoning, *[Eigen-1: Adaptive Multi-Agent Refinement with Monitor-Based RAG for Scientific Reasoning](https://arxiv.org/pdf/2509.21193)* reached **<span class="highlight-red">36w views</span>** on [BiliBili](https://www.bilibili.com/video/BV1own2zFEf7/?share_source=copy_web&vd_source=7b9d898a8c3bbebf65c411956ed7f8ce)!

- *2025.10*: Our new paper on multi-agent reasoning, *[Eigen-1: Adaptive Multi-Agent Refinement with Monitor-Based RAG for Scientific Reasoning](https://arxiv.org/pdf/2509.21193)* achieves **<span class="highlight-red">60%+</span>** score on [Humanity's Last Exam (HLE)](https://lastexam.ai/) benchmark, establishing a **<span class="highlight-red">new SOTA on HLE</span>**.

- *2025.09*: Two papers were accepted by NeurIPS 2025.

- *2025.08*: During my first year of PhD, my personal [Google Scholar](https://scholar.google.com/citations?user=lmCL5xQAAAAJ&hl=zh-CN&oi=ao) citations exceeded 100 🎉.

- *2025.06*: *[InfGen: A Resolution-Agnostic Paradigm for Scalable Image Synthesis](https://openaccess.thecvf.com/content/ICCV2025/papers/Han_InfGen_A_Resolution-Agnostic_Paradigm_for_Scalable_Image_Synthesis_ICCV_2025_paper.pdf)* was accepted by ICCV 2025.

- *2025.06*: Our website [PrismaX](https://discovery.intern-ai.org.cn/sciprismax), an evaluation-driven platform for AI scientific discovery, is launched 🎉.

- *2024.09*: *[Generalizing Weather Forecast to Fine-grained Temporal Scales via Physics-AI Hybrid Modeling](https://proceedings.neurips.cc/paper_files/paper/2024/file/298c3e32d7d402189444be2ff5d19979-Paper-Conference.pdf)* (first author) was accepted by NeurIPS 2024.

- *2024.05*: *[CasCast: Skillful High-resolution Precipitation Nowcasting via Cascaded Modelling](https://openreview.net/pdf?id=YuNFJSEkTi)* was accepted by ICML 2024.
{% endcapture %}

<div class="news-wrapper">
  <div class="news-content" id="newsContent">
    <div class="news-overlay"></div>
    {{ news_items | markdownify }}
  </div>
  <div class="news-toggle-container">
    <button class="news-toggle-btn" id="newsToggleBtn" onclick="toggleNews()">
      <span>Show More</span>
      <i class="fas fa-chevron-down"></i>
    </button>
  </div>
</div>
