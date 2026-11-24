---
title: "Practical Experience with Embodied AI"
date: 2026-11-24
lang: en
translation_key: bimanual-manipulation-engineering
permalink: /blogs/embodied-ai-practical-experience/
redirect_from: /blogs/bimanual-manipulation-engineering/
description: "Five lessons from bringing a bimanual robot policy from demonstrations to the lab, motivated by premature grasps, chunk handoff delays, and tool alignment errors."
cover: /blogs/embodied-ai-practical-experience/assets/chunk-timeline.png
---

> You can see more real-robot demonstrations on the [project page](https://black-yt.github.io/embodied-ai-projects/projects/project-01/).

“Transfer the liquid from the dish into the small tube.” To follow that instruction, a bimanual robot has to bring the pipette tip to the liquid surface and then move it to a narrow opening. In the final centimeters, the tool has to line up, the other arm has to hold its pose, and the thumb has to press once the tip is in place. The head camera shows where the vessels sit on the bench. The wrist cameras show the relative positions of the opening, the tip, and the fingers.

We study this kind of bimanual dexterity in a tabletop cell-culture workflow. The full workflow also includes picking up the tool, changing its tip, and moving vessels. We began with four transfers and two mixing operations that can be trained and run as standalone skills. The policy generates actions from a natural-language instruction and the three camera views. The demonstration pool contains **3,507 full trajectories** across 12 tasks, totaling about **2,500 minutes** based on synchronized samples at 30 Hz. How reliably the actions run depends on where a demonstration starts, how action chunks meet, and what coordinates the model uses for its targets.

## Why did the gripper close before alignment?

Picking up the tool was where we first ran into a timing problem. The policy could move toward the tool, yet the gripper sometimes closed before alignment. The first predicted chunk also tended to hold or jitter briefly before the approach. Putting the demonstrations and predictions on one timeline showed that idle time before the operator began was included in the training labels for task onset.

In the tool-pickup demonstrations, very similar starting images could carry different action labels. Some operators were waiting after starting the recording. Others had already begun to approach the tool. With variable wait lengths, the policy saw similar geometry while learning to hold, move, and eventually close the gripper. When the policy predicts several steps at once, low-motion steps can also crowd out the beginning of useful motion in its first prediction. See ACT for background on action chunking [[1]](#ref-act).

We trimmed verified recording waits at the beginning and end of **206 tool-pickup demonstrations**. About a fifth of the frames were removed, and all trajectories were retained. Later robot runs showed improved approach and gripper timing. The revised policy also changed its supervision from a combination of joint and end-effector channels to end-effector pose and gripper commands. A controlled estimate of the trimming effect would keep the action representation, training budget, and initialization fixed, then measure motion onset and premature closures with and without trimming.

A separate pass screened whole demonstrations. At 30 Hz, **62 consecutive samples** span **61/30 seconds**, just over **2 seconds**. A trajectory was excluded if the range from minimum to maximum stayed at or below **0.01 in native units** for every measured arm and hand channel in such a window. The table covers the 11 task groups that used this rule. One group of 300 trajectories was carried over unchanged. The 0.01 threshold belongs to this dataset and should be calibrated again when sensor noise or channel units change.

A hold after pressing a button and a settling period after gripping a tool can both look quiet in encoder data. Frame-level trimming therefore used the video, gripper commands, and task phase to identify recording waits. Any accepted crop was applied to the three camera streams, state, and action labels on the same timeline. Dropping samples inside a valid action would change what the next-step label means in time.

*Table 1. The two data passes. Trimming counts frames, while whole-demonstration screening counts trajectories.*
{: .blog-table-caption #data-cleaning}

<div class="blog-table-scroll" role="region" aria-labelledby="data-cleaning" tabindex="0" markdown="1">

| Processing step | Input | Retained | Removed |
| --- | ---: | ---: | ---: |
| Trim tool-pickup recording waits | 49,704 frames | 38,693 frames | 11,011 frames (22.2%) |
| Screen whole tabletop demonstrations | 3,289 trajectories | 3,207 trajectories | 82 trajectories (2.5%) |

</div>

## Why did standalone starts need more coverage?

During repeated transfers, a middle repetition usually starts near the end of the previous one. The first starts from the prepared pose. The last may exit the container or hand the tool off to the next skill. Uniform sampling over the clips from a five-repetition demonstration gives 20% first, 60% middle, and 20% last. A policy deployed for a single repetition can consequently be underexposed to its most common starting state.

We annotated the verified core of each action and randomly kept **2–6 frames** of context on each side within approved boundaries. At 30 Hz, that is about **67–200 ms** per side. The context can include part of the approach or exit, up to the boundary of a neighboring core such as the previous aspiration or next press. Transfer into a small tube and mixing in that tube were labeled and trained independently. They have different start states, end states, and success criteria despite sharing a work area.

The sampler first selects first, middle, or last with equal probability, then draws a clip in that class, giving the three classes roughly **1:1:1** sampling mass. Training and validation are grouped by the original demonstration, so all clips derived from one recording stay on the same side. This prevents overlapping transition frames from leaking into validation. In review, we examine starts from the prepared pose and final exits separately. Balanced training still needs independent physical evaluation across setups and start states.

## How can we suppress jitter and preserve the target?

On the robot, the end effector can move broadly in the right direction while the points within a chunk oscillate. A mean joint error can hide rapid variation between consecutive commands. A moving average close to a tube opening can also move the intended tool target. We wanted a way to adjust the path inside each chunk while preserving the measured initial pose, predicted final pose, and gripper timing.

Prepend the current end-effector position to the predicted sequence to form a reference $$r=(r_0,\ldots,r_T)$$. For uniformly spaced samples, the third finite difference $$D_3x_t=x_{t+3}-3x_{t+2}+3x_{t+1}-x_t$$ measures changes in acceleration. The classical minimum-jerk objective penalizes integrated squared jerk [[2]](#ref-minimum-jerk). Here the position subproblem also includes a fidelity term to preserve the prediction.

$$
\min_{x_1,\ldots,x_{T-1}}
\sum_{t=1}^{T-1}\lVert x_t-r_t\rVert_2^2
+\lambda\lVert D_3x\rVert_2^2,
\qquad x_0=r_0,\quad x_T=r_T.
$$

For a fixed $$\lambda$$, a linear solve gives the solution. The implementation checks the deviation at each interior point, reduces the weight if needed, and searches the bracket by bisection. The tested limits were **2 mm** for position and **1°** for orientation. For orientation, we align the signs of neighboring quaternions, optimize rotation vectors relative to the initial orientation, and check angular deviations on SO(3). Gripper commands pass through unchanged. If the controller sends the smoothed actions, the action history also records the commands that were sent.

![Raw and smoothed versions of the same offline position sequence, with the same two endpoints.]({{ '/blogs/embodied-ai-practical-experience/assets/bounded-smoothing.png' | relative_url }})
{: .blog-figure-image}

*Figure 1. A constructed one-dimensional check of the smoother. The largest position adjustment is about 2 mm, and the final point stays at 20 mm.*
{: .blog-caption}

A separate replay used ten saved model predictions. The median smoothing time was **3.94 ms per chunk**, and the largest position and orientation deviations were about **2.00 mm** and **0.84°**, respectively. The replay used the first predicted point as a proxy for the measured initial pose. It checks the numerical constraints and cost. A paired physical test with an identical setup and start state is needed to judge contact and alignment. Endpoint constraints fix pose, so speed and acceleration at the handoff and minimum clearance need their own checks.

## How can the policy plan while the robot moves?

Early scheduling left a gap between chunks. Waiting for a chunk to finish before collecting images and running inference left the arm waiting at each handoff. Feeding an older image into a parallel request creates a second problem. The next chunk may start from a visual state the robot has already moved past. Even during a short approach to a tube opening, this difference can affect alignment.

A world action model predicts future imagery and actions from visual and action history. While the robot executes chunk $$A_k$$, the future dynamics module (FDM) uses the available observations and current actions to forecast visual features at the end of the chunk. The policy uses that forecast to prepare $$A_{k+1}$$. Preparing the next chunk early and making its first commands continuous are separate design problems. For an example of the latter, see the prefix constraints used in real-time chunking [[3]](#ref-real-time-chunking).

Both sides predict the current action from `frame[i]`. On the left, the policy waits for the robot to finish and for the camera to capture the next frame. On the right, the FDM predicts `frame[i + 1]` while the robot moves, so the policy can compute the next action early.

![Side-by-side pseudocode. Red marks the wait for motion to finish on the left. On the right, the FDM predicts frame i+1 during motion so the policy can compute the next action early. The real camera frame is then written to the same index.]({{ '/blogs/embodied-ai-practical-experience/assets/async-pseudocode.png' | relative_url }})
{: .blog-pseudocode}

The last two lines on the right capture `real_frame` and write it to `frame[i + 1]`, restoring the observed image for subsequent inference.

![Serial scheduling runs inference after execution. Asynchronous scheduling places the future visual prediction and next action inference inside the current execution window.]({{ '/blogs/embodied-ai-practical-experience/assets/chunk-timeline.png' | relative_url }})
{: .blog-figure-image}

*Figure 2. Asynchronous lookahead schedules computation inside the current action window. Observed feedback subsequently corrects the history. Timing is schematic.*
{: .blog-caption}

This execution path sends **16 control targets** per chunk. The serial time is approximately $$T_{\mathrm{exec}}+T_{\mathrm{infer}}$$. In steady state, overlap can approach $$\max(T_{\mathrm{exec}},T_{\mathrm{infer}})$$ plus scheduling and handoff overhead. An independent timing run measured 11 steady cycles, including history correction and next-chunk inference, at **0.808 s median** and **0.823 s P90**. A 30 Hz command rate gives a nominal **0.533 s** execution window, so that inference workload cannot fit within it. At 18 Hz the nominal window is **0.889 s**, which can contain the measured durations. Changing the rate also changes physical motion speed and needs its own validation.

*Table 2. Historical scheduling test with robot control output blocked. Each rate ran 10 chunks and 160 targets. Steady-cycle times are approximate.*
{: .blog-table-caption #async-timing}

<div class="blog-table-scroll" role="region" aria-labelledby="async-timing" tabindex="0" markdown="1">

| Command rate | Nominal 16-step window | Approximate steady cycle | Main bottleneck |
| ---: | ---: | ---: | --- |
| 30 Hz | 0.533 s | 0.80 s | Inference |
| 17.78 Hz | 0.900 s | 0.91 s | Execution scheduling |
| 10 Hz | 1.600 s | 1.62 s | Execution scheduling |

</div>

These measurements describe command dispatch. To diagnose a handoff, I would log the last command in the current chunk, the next chunk's ready time, its first command, and the observation timestamps. The interval between commands across the boundary exposes idle time. Warm-up, history correction, and queueing are separate from a single model forward pass.

## Should the policy learn joint targets or end-effector poses?

If the main concern is whether the tip enters the tube, an end-effector pose (EE) is a natural target. Joint angles (Joint) express how individual joints should move when one arm needs to hold a particular posture. For a given joint trajectory, forward kinematics (FK) recovers the tool pose at each step. With a shared coordinate frame and the same continuous inverse kinematics (IK) branch, both representations can describe the same motion.

The training signal changes with the representation. Joint supervision is expressed in angles. Similar angular errors can produce different tip deviations at different postures. EE supervision is expressed in tool position and orientation, with IK selecting a joint solution at execution time. The practical choice depends on how much the task relies on tool alignment, a stable joint posture, or continuity of motion.

We trained Joint and EE versions on the same demonstrations of **picking up a pipette and attaching a new tip**. Both used the same pretrained initialization and **5,000 training steps**. We evaluated them on the same **30 validation trajectories**, covering **383 chunks of 50 steps and 18,497 valid frames**. Each open-loop chunk started from a recorded observation. We mapped Joint predictions to tool poses with FK and compared both versions with the demonstrated poses in a common frame. We measured position in millimeters and orientation with angular error, excluding padding at the end of chunks.

![Relative to Joint, EE has 5.2% and 21.9% higher mean position errors for the left and right arms. Its left-arm P95 is 8.0% lower and its right-arm P95 is 3.5% higher. Absolute values in millimeters are shown at right.]({{ '/blogs/embodied-ai-practical-experience/assets/action-representation-errors.png' | relative_url }})
{: .blog-figure-image}

*Figure 3. Relative change in end-effector position error from Joint to EE, computed as (EE − Joint) / Joint. Absolute errors in millimeters are shown on the right. P95 is the error at or below which 95% of valid frames fall.*
{: .blog-caption}

Joint had lower mean position and orientation errors for both arms in this comparison. EE had lower left-arm tail errors. The left position P95 dropped from **103.78 mm** to **95.50 mm**, and the left orientation P95 from **10.98°** to **10.62°**. The mean and the P95 can favor different choices when occasional large misses matter to the task.

These runs used relative joint targets and absolute EE targets, respectively, and each used its own state representation. To isolate the action output space, a follow-up should keep the state input and target reference convention fixed. For deployment, the task also determines what to measure. Insertion calls for tip alignment at the opening. A support phase calls for measuring drift in the other arm. The figure reports open-loop prediction errors.

## References
{: .blog-references-heading}

- <span id="ref-act"></span>[1] Zhao et al. [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705)

- <span id="ref-minimum-jerk"></span>[2] Flash and Hogan. [The Coordination of Arm Movements: An Experimentally Confirmed Mathematical Model](https://doi.org/10.1523/JNEUROSCI.05-07-01688.1985)

- <span id="ref-real-time-chunking"></span>[3] Black et al. [Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339)
