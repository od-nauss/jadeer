-- =============================================================
-- 13 — إصلاح بيانات المرشحين التجريبيين
-- شغّل هذا في Supabase SQL Editor
-- يحذف الملفات الفارغة ويُنشئ ملفات غنية مرتبطة بالمستخدمين الفعليين
-- =============================================================

DO $$
DECLARE
  v_saad   uuid;
  v_noura  uuid;
  v_aziz   uuid;
  v_hind   uuid;
  v_fahad  uuid;

  p_saad   uuid := gen_random_uuid();
  p_noura  uuid := gen_random_uuid();
  p_aziz   uuid := gen_random_uuid();
  p_hind   uuid := gen_random_uuid();
  p_fahad  uuid := gen_random_uuid();

  v_candidate_role_id uuid;
  v_assess_ids uuid[];
BEGIN

  -- جلب IDs المستخدمين
  SELECT id INTO v_saad   FROM users WHERE email = 'saad@nauss.edu.sa';
  SELECT id INTO v_noura  FROM users WHERE email = 'noura@nauss.edu.sa';
  SELECT id INTO v_aziz   FROM users WHERE email = 'abdulaziz@nauss.edu.sa';
  SELECT id INTO v_hind   FROM users WHERE email = 'hind@nauss.edu.sa';
  SELECT id INTO v_fahad  FROM users WHERE email = 'fahad@nauss.edu.sa';

  -- دور المرشح
  SELECT id INTO v_candidate_role_id FROM roles WHERE code = 'candidate';

  -- تعيين دور المرشح لمن لا يملكه
  INSERT INTO user_roles(user_id, role_id)
  SELECT u, v_candidate_role_id FROM (VALUES (v_saad),(v_noura),(v_aziz),(v_hind),(v_fahad)) t(u)
  WHERE u IS NOT NULL
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- حذف أي ملفات قديمة مرتبطة بهذه الحسابات
  DELETE FROM candidate_profiles
  WHERE user_id IN (v_saad, v_noura, v_aziz, v_hind, v_fahad);

  -- ============================================================
  -- سعد الحارثي — قائد استراتيجي — 78% — جاهز خلال سنة
  -- ============================================================
  IF v_saad IS NOT NULL THEN
    INSERT INTO candidate_profiles (
      id, user_id, status, completion_score, evaluation_track,
      years_of_experience, qualification, specialization, educational_institution,
      professional_certifications, internal_experience, current_tasks,
      past_leadership_tasks, led_projects, committee_participations, is_demo
    ) VALUES (
      p_saad, v_saad, 'under_governance_review', 88, 'individual',
      12, 'ماجستير إدارة الأعمال', 'التخطيط الاستراتيجي والسياسات المؤسسية', 'جامعة الملك عبدالعزيز',
      'PMP، Six Sigma Green Belt، إدارة المشاريع الاحترافية',
      'قاد فريق التخطيط الاستراتيجي لمدة 5 سنوات، وأشرف على إعداد الخطة الاستراتيجية 2025-2030، وشارك في 12 لجنة مؤسسية عليا.',
      'مدير مشاريع التحول المؤسسي — إشراف على 4 مشاريع متوازية بفريق من 18 شخصاً.',
      'رأس لجنة إعداد الخطة الاستراتيجية، وقاد مشروع التحول الرقمي الذي رُفع لمجلس الجامعة.',
      'مشروع تطوير منظومة البحث العلمي (18 شهراً)، مشروع ربط الأداء بالمستهدفات الاستراتيجية (12 شهراً).',
      'لجنة الخطة الاستراتيجية، لجنة التحول الرقمي، لجنة تطوير الهيكل التنظيمي، اللجنة الأكاديمية العليا.',
      true
    );

    INSERT INTO initiatives (candidate_profile_id, name, role, problem_description, achieved_impact, impact_metrics, evidence, is_sustainable, is_demo) VALUES
      (p_saad, 'منظومة قياس الأداء المؤسسي', 'قائد المبادرة',
       'غياب آلية موحدة لمتابعة الأداء المؤسسي وربطه بالمستهدفات الاستراتيجية.',
       'أتاح للقيادة رؤية لحظية للأداء، وخفّض وقت تقارير الأداء من أسبوعين إلى 48 ساعة.',
       'تقليل وقت إعداد التقارير بنسبة 85%، رضا الإدارة العليا 94%، تبنّي 7 إدارات للنظام.',
       'شهادة الرئيس التنفيذي، تقارير لوحة البيانات، محضر اجتماع مجلس الجامعة.',
       true, true),
      (p_saad, 'إعادة هيكلة الخطة الاستراتيجية 2025-2030', 'المُعِدّ الرئيسي',
       'الخطة القديمة لم تعكس التحولات التقنية ومتطلبات الاعتماد الأكاديمي الدولي.',
       'خطة استراتيجية جديدة اعتمدها المجلس وحازت تقييم ممتاز من هيئة التقييم الأكاديمي.',
       'اعتماد المجلس الكامل، 23 مؤشر أداء رئيسي محدث، 5 محاور استراتيجية جديدة.',
       'قرار مجلس الجامعة، تقرير هيئة الاعتماد، وثائق الخطة المعتمدة.',
       true, true),
      (p_saad, 'برنامج التميز في قيادة الفرق', 'مصمم ومشرف البرنامج',
       'ضعف كفاءة الفرق القيادية المتوسطة وغياب برامج تطويرهم المؤسسي.',
       'تطوير 45 قائداً في 3 دفعات، ارتفاع مؤشر الأداء الوظيفي للمشاركين بنسبة 28%.',
       'معدل رضا المشاركين 96%، ارتفاع إنتاجية الفرق 28%، تطبيق فوري في 15 مشروعاً.',
       'شهادات الحضور، تقارير الموارد البشرية، استبيان الأثر بعد 6 أشهر.',
       true, true);

    INSERT INTO kpis (candidate_profile_id, name, target_value, actual_value, unit, evidence, used_in_decision, is_officially_approved, is_demo) VALUES
      (p_saad, 'نسبة ربط المشاريع بالمستهدفات الاستراتيجية', '80', '94', '%', 'تقرير لوحة الأداء المؤسسي', 'في تقييم الخطة السنوية أمام مجلس الجامعة', true, true),
      (p_saad, 'رضا الشركاء الداخليين عن مخرجات التخطيط', '85', '91', '%', 'استبيان فصلي معتمد من الموارد البشرية', 'في مراجعة أداء الإدارة السنوية', true, true),
      (p_saad, 'معدل إنجاز المشاريع الاستراتيجية في موعدها', '90', '87', '%', 'نظام إدارة المشاريع الرسمي', 'في تقرير التقدم الفصلي لمجلس الجامعة', false, true);

    INSERT INTO leadership_cards (
      candidate_profile_id, total_score, trust_score, readiness_level, leadership_type,
      ai_summary, primary_strengths, development_gaps, axis_scores, is_published, is_demo
    ) VALUES (
      p_saad, 78, 85, 'ready_within_year', 'strategic',
      'مرشح يمتلك ملفاً استراتيجياً قوياً مع مبادرات موثقة وأثر مؤسسي واضح. يحتاج إلى تجربة قيادية ميدانية إضافية في بيئات متغيرة قبل التكليف القيادي الكامل. تقييم 360 يؤكد قدراته الاستراتيجية لكنه يُشير لفرصة تطوير في إدارة الأزمات.',
      '["تخطيط استراتيجي متميز","قيادة المشاريع المعقدة","بناء الشراكات المؤسسية","تحليل البيانات وصنع القرار","الإقناع والتأثير"]'::jsonb,
      '["تطوير مهارات إدارة الأزمات","توسيع تجربة قيادة الفرق الكبيرة","تعزيز التواصل مع أصحاب المصلحة الخارجيين"]'::jsonb,
      '{"leadership":82,"strategic":91,"performance":85,"innovation":76,"team":74,"technology":70,"integrity":88}'::jsonb,
      false, true
    );
  END IF;

  -- ============================================================
  -- نورة القحطاني — قائدة تشغيلية — 87% — جاهزة الآن
  -- ============================================================
  IF v_noura IS NOT NULL THEN
    INSERT INTO candidate_profiles (
      id, user_id, status, completion_score, evaluation_track,
      years_of_experience, qualification, specialization, educational_institution,
      professional_certifications, internal_experience, current_tasks,
      past_leadership_tasks, led_projects, committee_participations, is_demo
    ) VALUES (
      p_noura, v_noura, 'approved', 95, 'individual',
      10, 'ماجستير إدارة الجودة والتميز المؤسسي', 'إدارة العمليات والتحسين المستمر', 'جامعة الملك فهد للبترول والمعادن',
      'Lean Six Sigma Black Belt، معتمدة تميز EFQM، PMP',
      'قادت إدارة العمليات لمدة 6 سنوات، طورت 14 إجراءً تشغيلياً، قادت 3 مشاريع تحسين حصدت جوائز التميز.',
      'رئيس قسم العمليات — إشراف على فريق من 22 موظفاً، مسؤولة عن 4 وحدات تشغيلية.',
      'قادت مشروع إعادة هيكلة العمليات الذي خفّض التكاليف التشغيلية 18%، ورأست لجنة التميز المؤسسي.',
      'مشروع تطوير منظومة الجودة الشاملة (24 شهراً)، مشروع الخدمة الرقمية للمستفيدين (14 شهراً).',
      'لجنة التميز المؤسسي، لجنة تطوير الإجراءات، لجنة سعادة المستفيدين، لجنة الجودة الأكاديمية.',
      true
    );

    INSERT INTO initiatives (candidate_profile_id, name, role, problem_description, achieved_impact, impact_metrics, evidence, is_sustainable, is_demo) VALUES
      (p_noura, 'تحويل الخدمات إلى رقمية بالكامل', 'قائدة المبادرة',
       'اعتماد الجامعة على الإجراءات الورقية رفع أوقات الانتظار وخفض رضا المستفيدين.',
       'تحويل 34 إجراءً إلى رقمي، خفض وقت الخدمة من 5 أيام إلى 6 ساعات، رضا المستفيدين 95%.',
       'توفير 2,400 ساعة عمل شهرياً، خفض الأخطاء 73%، رضا المستفيدين 95%.',
       'تقرير التحول الرقمي المعتمد، مؤشرات مركز الخدمة، جائزة التميز الحكومية.',
       true, true),
      (p_noura, 'منظومة إدارة الأداء المتكاملة', 'مصممة ومنفذة المنظومة',
       'غياب نظام موحد لقياس وتتبع أداء الموظفين بشكل عادل وشفاف.',
       'تطبيق نظام أداء شامل لـ 280 موظف، رفع نسبة رضا الموظفين عن آلية التقييم من 41% إلى 87%.',
       'رضا الموظفين 87%، انخفاض النزاعات المتعلقة بالأداء 64%، اعتماد المنظومة من الموارد البشرية المركزية.',
       'تقرير الموارد البشرية، استبيان رضا الموظفين، قرار اعتماد المنظومة.',
       true, true),
      (p_noura, 'برنامج قيادات العمليات التنفيذية', 'مؤسسة ومديرة البرنامج',
       'نقص في رصيد القيادات التشغيلية الجاهزة لتولي المناصب القيادية المتوسطة.',
       'تخريج 38 قائداً تشغيلياً، توليّ 12 منهم مناصب قيادية خلال عام من التخرج.',
       'معدل التوظيف القيادي للخريجين 31%، رضا أصحاب العمل 94%، استمرارية البرنامج لدورة ثانية.',
       'شهادات التخرج، بيانات التوظيف، تقارير متابعة الخريجين.',
       true, true),
      (p_noura, 'نظام إدارة مخاطر العمليات', 'المحرك الرئيسي للمشروع',
       'ضعف التحوط من المخاطر التشغيلية وغياب خطط استمرارية العمل الموثقة.',
       'إنشاء سجل مخاطر شامل لـ 6 إدارات، ورفع جاهزية خطط استمرارية الأعمال من 20% إلى 90%.',
       'تقليل الحوادث التشغيلية 45%، جاهزية استمرارية الأعمال 90%، اعتماد الإطار من لجنة المخاطر.',
       'سجل المخاطر المعتمد، تقرير لجنة المخاطر، شهادة ISO 22301.',
       true, true);

    INSERT INTO kpis (candidate_profile_id, name, target_value, actual_value, unit, evidence, used_in_decision, is_officially_approved, is_demo) VALUES
      (p_noura, 'رضا المستفيدين عن الخدمات', '88', '95', '%', 'نظام الاستبيانات الفصلية المعتمد', 'في مراجعة أداء الإدارة أمام الرئيس التنفيذي', true, true),
      (p_noura, 'معدل إنجاز الإجراءات في الوقت المحدد', '92', '97', '%', 'نظام إدارة الوثائق الإلكتروني', 'في تقرير التميز المؤسسي الربعي', true, true),
      (p_noura, 'رضا موظفي القسم عن بيئة العمل', '80', '91', '%', 'استبيان المناخ المؤسسي السنوي', 'في تقرير الموارد البشرية للإدارة العليا', true, true),
      (p_noura, 'نسبة خفض التكاليف التشغيلية', '15', '18', '%', 'التقارير المالية المدققة', 'في الاجتماع السنوي لمجلس الإدارة', true, true);

    INSERT INTO leadership_cards (
      candidate_profile_id, total_score, trust_score, readiness_level, leadership_type,
      ai_summary, primary_strengths, development_gaps, axis_scores, is_published, is_demo
    ) VALUES (
      p_noura, 87, 91, 'ready_now', 'operational',
      'مرشحة استثنائية تتميز بتناسق نادر بين المبادرات والمؤشرات وتقييم 360. سجلها التشغيلي موثق بشواهد دامغة، ورضا الفريق مرتفع جداً مما يعكس نضجاً قيادياً حقيقياً. اللجنة توصي بالاعتماد الفوري وإتاحة فرصة تكليف قيادي تنفيذي خلال الستة أشهر القادمة.',
      '["قوة تشغيلية استثنائية","قيادة التحسين المستمر","رضا فريق مرتفع جداً","مؤشرات أداء موثقة ومعتمدة","بناء برامج تطوير القيادات"]'::jsonb,
      '["تعزيز التفكير الاستراتيجي طويل المدى","توسيع العلاقات مع الشركاء الخارجيين"]'::jsonb,
      '{"leadership":88,"strategic":79,"performance":94,"innovation":82,"team":93,"technology":80,"integrity":95}'::jsonb,
      true, true
    );
  END IF;

  -- ============================================================
  -- عبدالعزيز الدوسري — قائد تقني — 62% — واعد
  -- ============================================================
  IF v_aziz IS NOT NULL THEN
    INSERT INTO candidate_profiles (
      id, user_id, status, completion_score, evaluation_track,
      years_of_experience, qualification, specialization, educational_institution,
      professional_certifications, internal_experience, current_tasks,
      past_leadership_tasks, led_projects, committee_participations, is_demo
    ) VALUES (
      p_aziz, v_aziz, 'under_governance_review', 82, 'individual',
      7, 'ماجستير علوم الحاسب والذكاء الاصطناعي', 'الذكاء الاصطناعي وتعلم الآلة', 'جامعة الملك عبدالله للعلوم والتقنية (كاوست)',
      'AWS Certified ML Specialist، Google Professional Data Engineer، TensorFlow Developer',
      'مهندس بيانات أول في قسم الذكاء الاصطناعي 3 سنوات، طور 6 نماذج بيانات مؤسسية، قاد مشروع تطبيق GPT داخلي.',
      'مهندس بيانات أول — تصميم وتطوير نماذج الذكاء الاصطناعي للجامعة، إشراف على فريق تقني من 5 مهندسين.',
      'قاد مشروع المساعد الذكي الداخلي، أشرف على تطوير منظومة تحليل البيانات الأكاديمية.',
      'مشروع تطبيق الذكاء الاصطناعي في خدمة الطلاب (12 شهراً)، مشروع تحليل البيانات الأكاديمية (9 أشهر).',
      'لجنة التحول الرقمي، مجموعة العمل للذكاء الاصطناعي.',
      true
    );

    INSERT INTO initiatives (candidate_profile_id, name, role, problem_description, achieved_impact, impact_metrics, evidence, is_sustainable, is_demo) VALUES
      (p_aziz, 'المساعد الذكي لخدمة الطلاب', 'مطور ومشغّل المشروع',
       'تكدس الاستفسارات اليدوية وطول أوقات الانتظار في خدمة الطلاب.',
       'نظام محادثة ذكي يعالج 82% من الاستفسارات آلياً بدقة 91%.',
       'توفير 1,800 ساعة عمل شهرياً، رضا الطلاب 88%، خفض وقت الاستجابة من يومين إلى 4 دقائق.',
       'إحصاءات النظام، استبيان رضا الطلاب، تقرير وحدة الخدمات التقنية.',
       true, true),
      (p_aziz, 'منصة تحليل الأداء الأكاديمي بالذكاء الاصطناعي', 'المصمم الرئيسي',
       'غياب أدوات تحليلية تساعد القيادة الأكاديمية على فهم أنماط الأداء والتنبؤ بالمخاطر.',
       'لوحة تحليلية تعرض 40 مؤشراً بالوقت الفعلي لـ 3 إدارات أكاديمية.',
       'رفع سرعة اتخاذ القرار الأكاديمي 60%، اعتماد القيادة للوحة في اجتماعاتها الشهرية.',
       'تقرير مجلس الشؤون الأكاديمية، إحصاءات استخدام اللوحة، شهادة عميد الكلية.',
       false, true);

    INSERT INTO kpis (candidate_profile_id, name, target_value, actual_value, unit, evidence, used_in_decision, is_officially_approved, is_demo) VALUES
      (p_aziz, 'دقة نماذج الذكاء الاصطناعي المطورة', '85', '91', '%', 'تقارير أداء النماذج التقنية', 'في تقرير التحول الرقمي الفصلي', true, true),
      (p_aziz, 'نسبة الاستفسارات المعالجة آلياً', '75', '82', '%', 'إحصاءات نظام المحادثة الذكية', 'في تقرير الخدمات التقنية الشهري', false, true),
      (p_aziz, 'رضا المستخدمين عن الأدوات التقنية', '80', '88', '%', 'استبيان رضا المستخدمين الفصلي', 'في تقييم المشاريع التقنية', true, true);

    INSERT INTO leadership_cards (
      candidate_profile_id, total_score, trust_score, readiness_level, leadership_type,
      ai_summary, primary_strengths, development_gaps, axis_scores, is_published, is_demo
    ) VALUES (
      p_aziz, 62, 77, 'promising', 'technical',
      'مرشح واعد بكفاءة تقنية استثنائية ومبادرات رقمية ذات أثر ملموس. تقييم 360 يكشف فجوة في الجانب القيادي الإنساني وإدارة أصحاب المصلحة. يوصى ببرنامج تطوير مهارات الأشخاص والقيادة قبل منحه صلاحيات قيادية واسعة.',
      '["ابتكار تقني متقدم","تطبيق الذكاء الاصطناعي في حل المشكلات","أثر رقمي موثق","تطوير نماذج بيانات معقدة"]'::jsonb,
      '["تطوير مهارات قيادة الأشخاص","إدارة أصحاب المصلحة","التواصل مع غير التقنيين","بناء الثقة القيادية"]'::jsonb,
      '{"leadership":58,"strategic":65,"performance":72,"innovation":88,"team":55,"technology":95,"integrity":74}'::jsonb,
      false, true
    );
  END IF;

  -- ============================================================
  -- هند العتيبي — قائدة إنسانية — 76%
  -- ============================================================
  IF v_hind IS NOT NULL THEN
    INSERT INTO candidate_profiles (
      id, user_id, status, completion_score, evaluation_track,
      years_of_experience, qualification, specialization, educational_institution,
      professional_certifications, internal_experience, current_tasks,
      past_leadership_tasks, led_projects, committee_participations, is_demo
    ) VALUES (
      p_hind, v_hind, 'approved', 90, 'individual',
      9, 'ماجستير الموارد البشرية والسلوك التنظيمي', 'التطوير المؤسسي وإدارة المواهب', 'جامعة الإمارات العربية المتحدة',
      'SHRM-SCP، إدارة التغيير PROSCI، Coach معتمد ICF',
      'مديرة وحدة دعم الفرق والمستفيدين 4 سنوات، بنت ثقافة خدمة مميزة، أسست برنامج التوجيه للموظفين الجدد.',
      'مديرة وحدة دعم الفرق — 17 موظفاً مباشراً، مسؤولة عن تجربة المستفيدين الداخليين والخارجيين.',
      'أسست برنامج الإرشاد المؤسسي، قادت مبادرة رفع مؤشر سعادة الموظفين من 61% إلى 89%.',
      'برنامج بناء الفريق عالي الأداء (18 شهراً)، مشروع منصة سعادة المستفيد (10 أشهر).',
      'لجنة سعادة الموظفين، لجنة التطوير المؤسسي، لجنة الثقافة التنظيمية.',
      true
    );

    INSERT INTO initiatives (candidate_profile_id, name, role, problem_description, achieved_impact, impact_metrics, evidence, is_sustainable, is_demo) VALUES
      (p_hind, 'برنامج الإرشاد القيادي المؤسسي', 'مؤسسة ومديرة البرنامج',
       'غياب برنامج إرشاد منظم لدعم الموظفين الجدد والقيادات الناشئة.',
       'برنامج إرشاد ربط 52 موظفاً جديداً بقيادات متمرسة، خفض معدل دوران الموظفين 34%.',
       'معدل احتفاظ الموظفين 94%، رضا المشاركين 97%، انخفاض دوران الموظفين 34%.',
       'تقارير الموارد البشرية، استبيان رضا المشاركين، شهادة المدير التنفيذي.',
       true, true),
      (p_hind, 'منصة سعادة المستفيد الداخلي', 'قائدة المبادرة',
       'ضعف تجربة الموظف الداخلي وانعكاسه على الخدمات المقدمة للمستفيدين الخارجيين.',
       'رفع مؤشر رضا المستفيد الداخلي من 67% إلى 92%، وتحسين مؤشر الخدمة الخارجية تبعاً لذلك.',
       'رضا المستفيد الداخلي 92%، تحسن الخدمة الخارجية 23%، جائزة أفضل مبادرة تجربة موظف.',
       'بيانات المنصة، استبيانات الرضا، جائزة التميز المؤسسي.',
       true, true);

    INSERT INTO kpis (candidate_profile_id, name, target_value, actual_value, unit, evidence, used_in_decision, is_officially_approved, is_demo) VALUES
      (p_hind, 'مؤشر سعادة الموظفين (eNPS)', '75', '89', 'نقطة', 'استبيان المناخ المؤسسي السنوي', 'في تقرير التنمية البشرية للإدارة العليا', true, true),
      (p_hind, 'معدل احتفاظ الموظفين الموهوبين', '88', '94', '%', 'تقارير الموارد البشرية الفصلية', 'في مراجعة خطة الموارد البشرية السنوية', true, true),
      (p_hind, 'رضا المستفيدين الداخليين عن الدعم', '80', '92', '%', 'استبيان تجربة الموظف الفصلي', 'في تقرير قسم الخدمات الداخلية', false, true);

    INSERT INTO leadership_cards (
      candidate_profile_id, total_score, trust_score, readiness_level, leadership_type,
      ai_summary, primary_strengths, development_gaps, axis_scores, is_published, is_demo
    ) VALUES (
      p_hind, 76, 88, 'human_leader', 'human_leader',
      'قائدة إنسانية استثنائية تتمتع بذكاء عاطفي مرتفع وقدرة فائقة على بناء ثقة الفريق وتحفيزه. تقييم 360 يُجمع على كفاءتها القيادية الإنسانية. الفجوة الرئيسية في التفكير الاستراتيجي وإدارة المؤشرات، مما يحدّ من جاهزيتها لقيادة وحدات كبيرة متنوعة الأدوار.',
      '["ذكاء عاطفي استثنائي","بناء ثقة الفريق","إدارة الخلافات","تطوير المواهب","ثقافة الرعاية المؤسسية"]'::jsonb,
      '["تقوية التفكير الاستراتيجي","إدارة المؤشرات والنتائج الكمية","الحزم في القرارات الصعبة"]'::jsonb,
      '{"leadership":78,"strategic":62,"performance":74,"innovation":71,"team":96,"technology":63,"integrity":91}'::jsonb,
      true, true
    );
  END IF;

  -- ============================================================
  -- فهد المطيري — أداء عالٍ / رضا فريق منخفض — 81%
  -- ============================================================
  IF v_fahad IS NOT NULL THEN
    INSERT INTO candidate_profiles (
      id, user_id, status, completion_score, evaluation_track,
      years_of_experience, qualification, specialization, educational_institution,
      professional_certifications, internal_experience, current_tasks,
      past_leadership_tasks, led_projects, committee_participations, is_demo
    ) VALUES (
      p_fahad, v_fahad, 'under_governance_review', 91, 'individual',
      11, 'ماجستير ضمان الجودة والتميز', 'أنظمة الجودة والاعتماد المؤسسي', 'جامعة الملك سعود',
      'ISO 9001 Lead Auditor، EFQM Assessor، Lean Six Sigma Black Belt',
      'مدير إدارة الجودة 5 سنوات، حصل على 3 اعتمادات دولية للجامعة، أنجز 8 مشاريع تحسين كبرى.',
      'مدير إدارة الجودة والامتثال — فريق من 14 متخصصاً، مسؤول عن الاعتماد الأكاديمي والمؤسسي الدولي.',
      'نال جائزة التميز الحكومي مرتين، قاد الجامعة لنيل اعتماد AACSB و ABET معاً.',
      'مشروع الاعتماد الأكاديمي الدولي المزدوج (3 سنوات)، مشروع تطوير منظومة الجودة الشاملة (2 سنة).',
      'لجنة الاعتماد الدولي، لجنة التميز المؤسسي، لجنة الرقابة والتدقيق الداخلي، لجنة الحوكمة.',
      true
    );

    INSERT INTO initiatives (candidate_profile_id, name, role, problem_description, achieved_impact, impact_metrics, evidence, is_sustainable, is_demo) VALUES
      (p_fahad, 'الاعتماد الأكاديمي الدولي المزدوج AACSB+ABET', 'قائد فريق الاعتماد',
       'افتقار الجامعة لاعتمادات دولية معترف بها يحدّ من تنافسيتها الإقليمية والدولية.',
       'نيل الجامعة اعتمادَي AACSB وABET في عام واحد — إنجاز لم يحققه أي جامعة خليجية بهذه السرعة.',
       'اعتمادان دوليان مرموقان، ارتفاع ترتيب الجامعة 18 مرتبة في التصنيف الإقليمي.',
       'شهادات الاعتماد الدولية، تقرير لجنة التحكيم الدولية، قرار مجلس الجامعة.',
       true, true),
      (p_fahad, 'منظومة الجودة الشاملة TQM', 'المصمم والمنفذ الرئيسي',
       'تشتت جهود الجودة وغياب منظومة موحدة تربط جميع عمليات الجامعة بمعايير الجودة.',
       'بناء منظومة جودة شاملة تضم 312 مؤشراً قياسياً تغطي 95% من العمليات المؤسسية.',
       '312 مؤشر جودة مُقنَّن، تغطية 95% من العمليات، اعتماد المنظومة من الوزارة كنموذج.',
       'وثائق المنظومة، تقرير التدقيق الخارجي، قرار الاعتماد الوزاري.',
       true, true),
      (p_fahad, 'مشروع تحسين رضا الموظفين', 'مشرف على المشروع',
       'انخفاض مؤشر رضا الموظفين عن بيئة العمل في إدارته رغم تميز النتائج التشغيلية.',
       'ارتفاع مؤشر رضا الموظفين من 58% إلى 71% بعد تطبيق برنامج تحسين البيئة.',
       'ارتفاع الرضا 13 نقطة، انخفاض الشكاوى الداخلية 40%، ولا تزال الفجوة قائمة وتحتاج متابعة.',
       'استبيانات الرضا السنوية، تقارير الموارد البشرية، ملاحظات تقييم 360.',
       false, true);

    INSERT INTO kpis (candidate_profile_id, name, target_value, actual_value, unit, evidence, used_in_decision, is_officially_approved, is_demo) VALUES
      (p_fahad, 'عدد الاعتمادات الدولية المستحدثة', '2', '3', 'اعتماد', 'شهادات الاعتماد الدولية الرسمية', 'في تقرير مجلس الجامعة السنوي', true, true),
      (p_fahad, 'نسبة العمليات الخاضعة لإطار الجودة', '90', '95', '%', 'تقرير التدقيق الداخلي الشامل', 'في مراجعة منظومة الجودة نصف السنوية', true, true),
      (p_fahad, 'رضا موظفي الإدارة عن بيئة العمل', '82', '71', '%', 'استبيان المناخ المؤسسي السنوي', 'في تقرير الموارد البشرية للإدارة العليا', true, true),
      (p_fahad, 'درجة الامتثال لمعايير الجودة الدولية', '95', '98', '%', 'تقرير المدقق الخارجي المعتمد', 'في لجنة التدقيق والرقابة', true, true);

    INSERT INTO leadership_cards (
      candidate_profile_id, total_score, trust_score, readiness_level, leadership_type,
      ai_summary, primary_strengths, development_gaps, axis_scores, is_published, is_demo
    ) VALUES (
      p_fahad, 81, 79, 'high_performance_low_satisfaction', 'operational',
      'مرشح ذو إنجازات تشغيلية استثنائية وملف أكاديمي ومهني مميز. غير أن تقييم 360 يكشف فجوة واضحة بين تميز النتائج وانخفاض رضا الفريق، مما يستوجب تطوير الجانب القيادي الإنساني قبل توسيع نطاق المسؤولية. اللجنة توصي بخطة تطوير مركزة في مهارات الأشخاص.',
      '["إنجازات موثقة استثنائية","إدارة الجودة والاعتماد","الامتثال المؤسسي","المثابرة والحزم","الكفاءة التشغيلية"]'::jsonb,
      '["رضا الفريق منخفض — أولوية قصوى","مهارات الذكاء العاطفي","إدارة الخلافات","المرونة في أسلوب القيادة"]'::jsonb,
      '{"leadership":76,"strategic":74,"performance":95,"innovation":68,"team":52,"technology":72,"integrity":88}'::jsonb,
      false, true
    );
  END IF;

  RAISE NOTICE '✅ تم إنشاء ملفات المرشحين بنجاح';
END $$;
