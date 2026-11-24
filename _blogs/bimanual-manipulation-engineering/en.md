---
title: "Engineering Bimanual Dexterous Manipulation"
date: 2026-11-24
lang: en
translation_key: bimanual-manipulation-engineering
permalink: /blogs/bimanual-manipulation-engineering/
description: "Five lessons from bringing a bimanual robot policy from demonstrations to the lab, motivated by premature grasps, chunk handoff delays, and tool alignment errors."
cover: /blogs/bimanual-manipulation-engineering/assets/chunk-timeline.png
---

> This article is for readers who know the basics of imitation learning and want to deploy a policy on a real robot. The numbers come from a data audit, offline computations, no-motion timing tests, and physical trials. Each result is labeled with its measurement conditions.

When we asked a bimanual robot to pick up a tool, the policy could move toward it, yet the gripper sometimes closed before it was aligned. The first predicted chunk also tended to hold or jitter briefly before the approach. When we put the demonstrations and predictions on the same timeline, we saw that the wait before the operator began had been included in the training labels for task onset.

This article follows five problems that came up in deployment. The project uses a head camera, two wrist cameras, and a natural-language instruction to control both arms. We evaluate fine tool use on liquid transfer and mixing operations from a cell-culture workflow. The demonstration pool contains **3,507 full trajectories** from 12 tabletop tasks, totaling about **2,500 minutes** based on synchronized samples and a 30 Hz rate. Six standalone skills account for the physical trials discussed below. [Project page and trial videos](https://black-yt.github.io/embodied-ai-projects/projects/project-01/#gallery)

## Why did the gripper close before alignment?

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

![Raw and smoothed versions of the same offline position sequence, with the same two endpoints.]({{ '/blogs/bimanual-manipulation-engineering/assets/bounded-smoothing.png' | relative_url }})
{: .blog-figure-image}

*Figure 1. A constructed one-dimensional check of the smoother. The largest position adjustment is about 2 mm, and the final point stays at 20 mm.*
{: .blog-caption}

A separate replay used ten saved model predictions. The median smoothing time was **3.94 ms per chunk**, and the largest position and orientation deviations were about **2.00 mm** and **0.84°**, respectively. The replay used the first predicted point as a proxy for the measured initial pose. It checks the numerical constraints and cost. A paired physical test with an identical setup and start state is needed to judge contact and alignment. Endpoint constraints fix pose, so speed and acceleration at the handoff and minimum clearance need their own checks.

## How can the policy plan while the robot moves?

Early scheduling left a gap between chunks. Waiting for a chunk to finish before collecting images and running inference left the arm waiting at each handoff. Feeding an older image into a parallel request creates a second problem. The next chunk may start from a visual state the robot has already moved past. Even during a short approach to a tube opening, this difference can affect alignment.

A world action model predicts future imagery and actions from visual and action history. While the robot executes chunk $$A_k$$, the future dynamics module (FDM) uses the most recent grounded history and the actions in $$A_k$$ to forecast visual features at the future handoff. The policy uses that forecast to prepare $$A_{k+1}$$ while the current chunk runs. Once camera observations arrive, the executed actions and their observed outcomes correct the history for subsequent predictions. The forecast is provisional. The prefetch queue must stay aligned with the execution index and timestamps. Preparing the next chunk early and making its first commands continuous are separate design problems. For an example of the latter, see the prefix constraints used in real-time chunking [[3]](#ref-real-time-chunking).

![Serial scheduling runs inference after execution. Asynchronous scheduling places the future visual prediction and next action inference inside the current execution window.]({{ '/blogs/bimanual-manipulation-engineering/assets/chunk-timeline.png' | relative_url }})
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

## Why check both representations of the same trajectory?

During mixing in a tilted dish, the left hand presses the tool while the right arm should mostly hold position. An early policy using absolute joint targets produced an obvious right-arm jump. A later relative-joint policy kept that arm mostly still in physical tests while the left hand performed the mixing motion. An accurate transfer policy retained its absolute outputs. The useful debugging practice was to inspect each arm and each chunk boundary, because an average across both arms can hide motion in a limb that should stay still.

End-effector (EE) outputs specify the tool's target position and orientation. Inverse kinematics (IK) finds joint targets that realize the pose. Joint outputs specify the joint angles directly, and forward kinematics (FK) recovers the tool pose for checking. With the same timestamps, reference frame, tool center point, and continuous IK branch, the two representations can describe exactly the same trajectory. An EE target often has multiple IK solutions. Seeding from the previous joint configuration helps track the branch, alongside checks for joint limits, self-collision, and large steps. With relative joint outputs, the execution client reconstructs the absolute target using the measured joint state and the convention used in training. Grasp commands retain their own semantics.

For verification, use FK to compare predicted joint angles with demonstrated tool poses, and run IK on demonstrated poses to check the largest step at a boundary for each arm. In one test with hardware outputs blocked, **all 160 IK targets converged**, with a maximum position residual of about **9 μm**. That measures the numeric residual against the commanded target. Actual tool alignment depends on calibration, tool mounting, and object placement, so it needs visual and physical checks.

## What did the physical trials tell us to inspect next?

On one bimanual robot, the six standalone skills produced **55 trial records, 51 successes, and 4 failures (92.7%)**. One failure was at the source during aspiration. Three were at the target tube during alignment. In all three dispensing failures, the tool arrived near the target but the tip was slightly left of the opening and dispensed outside. That narrows the next experiment to comparing predicted actions, joint commands, and observed tip positions in the final centimeters with the setup held fixed. The video localizes the stage of failure. The individual contributions of model prediction, placement, and calibration still need controlled comparisons.

*Table 3. Video-scored physical trials for the six standalone skills.*
{: .blog-table-caption #physical-trials}

<div class="blog-table-scroll" role="region" aria-labelledby="physical-trials" tabindex="0" markdown="1">

| Skill | Successful / recorded |
| --- | ---: |
| Tube to dish · setup A | 5 / 5 |
| Tube to dish · setup B | 3 / 4 |
| Dish to tube | 14 / 16 |
| Tube A to tube B | 10 / 11 |
| Mixing in a tilted dish | 9 / 9 |
| Mixing in a tube | 10 / 10 |

</div>

The criteria were visible tool entry and exit, liquid response during a press, and delivery to the intended location. Two tilted-dish records with ambiguous cycle boundaries were counted as successes after operator review. Transfer volume and mixing quality still need quantitative measurement. Compare two public wrist-camera clips of the same task to inspect alignment near the end. [Successful dish-to-tube transfer](https://black-yt.github.io/embodied-ai-projects/projects/project-01/assets/media/dish-to-tube/02/left-wrist.mp4) · [Target opening missed](https://black-yt.github.io/embodied-ai-projects/projects/project-01/assets/media/dish-to-tube/01/left-wrist.mp4)

## References
{: .blog-references-heading}

- <span id="ref-act"></span>[1] Zhao et al. [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705)

- <span id="ref-minimum-jerk"></span>[2] Flash and Hogan. [The Coordination of Arm Movements: An Experimentally Confirmed Mathematical Model](https://doi.org/10.1523/JNEUROSCI.05-07-01688.1985)

- <span id="ref-real-time-chunking"></span>[3] Black et al. [Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339)
