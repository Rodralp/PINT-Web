import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import '../css/profile.css'

function readStoredLogin() {
  const session = sessionStorage.getItem('loginData')
  if (session) {
    try { return { data: JSON.parse(session), source: 'session' } } catch { /* ignore */ }
  }
  const local = localStorage.getItem('loginData')
  if (local) {
    try { return { data: JSON.parse(local), source: 'local' } } catch { /* ignore */ }
  }
  return { data: null, source: 'session' }
}

function persistStoredLogin(source, data) {
  const serialized = JSON.stringify(data)
  if (source === 'local') {
    localStorage.setItem('loginData', serialized)
    sessionStorage.removeItem('loginData')
    return
  }
  // default to session
  sessionStorage.setItem('loginData', serialized)
  localStorage.removeItem('loginData')
}

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const stored = readStoredLogin()
  const loginData = stored.data || {}

  const [name, setName] = useState(loginData.nome || '')
  const [location, setLocation] = useState(loginData.location || loginData.localidade || '')
  const [avatar, setAvatar] = useState(loginData.avatar || `https://i.pravatar.cc/120?u=${encodeURIComponent((loginData.email||loginData.nome||'').toLowerCase())}`)

  const [skills, setSkills] = useState(Array.isArray(loginData.skillsItems) ? loginData.skillsItems.map(s => ({ ...s, visible: typeof s.visible === 'boolean' ? s.visible : true })) : [])
  const [certifications, setCertifications] = useState(Array.isArray(loginData.certificationsItems) ? loginData.certificationsItems.map(c => ({ ...c, visible: typeof c.visible === 'boolean' ? c.visible : true })) : [])

  const addSkill = () => setSkills(s => [...s, { title: '', subtitleKey: '', accent: 'gold', visible: true }])
  const removeSkill = (idx) => setSkills(s => s.filter((_,i) => i!==idx))
  const updateSkill = (idx, patch) => setSkills(s => s.map((it,i) => i===idx ? { ...it, ...patch } : it))

  const addCert = () => setCertifications(s => [...s, { title: '', subtitleKey: '', accent: 'blue', visible: true }])
  const removeCert = (idx) => setCertifications(s => s.filter((_,i) => i!==idx))
  const updateCert = (idx, patch) => setCertifications(s => s.map((it,i) => i===idx ? { ...it, ...patch } : it))

  const onSave = (ev) => {
    ev.preventDefault()
    const newData = {
      ...loginData,
      nome: name,
      location,
      avatar,
      skillsItems: skills,
      certificationsItems: certifications,
    }

    persistStoredLogin(stored.source, newData)
    navigate('/profile')
  }

  return (
    <Layout>
      <div className="dashboard-consultor-page">
        <div className="dashboard-consultor-header">
          <h1>{t('profile_edit') || 'Editar Perfil'}</h1>
        </div>

        <form className="dashboard-card dashboard-profile-header p-3" onSubmit={onSave}>
          <div className="profile-header-content">
            <div className="profile-avatar">
              <img src={avatar} alt="avatar" />
            </div>
            <div style={{flex:1, marginLeft:16}}>
              <div className="mb-2">
                <label className="form-label">{t('profile_name') || 'Nome'}</label>
                <input className="form-control" value={name} onChange={e=>setName(e.target.value)} />
              </div>

              <div className="mb-2">
                <label className="form-label">{t('profile_location') || 'Localidade'}</label>
                <input className="form-control" value={location} onChange={e=>setLocation(e.target.value)} />
              </div>

              <div className="mb-2">
                <label className="form-label">{t('profile_avatar') || 'Foto (URL)'}</label>
                <input className="form-control" value={avatar} onChange={e=>setAvatar(e.target.value)} />
              </div>
            </div>
          </div>

          <hr />

          <div className="mb-3">
            <h4>{t('profile_skills') || 'Habilidades'}</h4>
            {skills.map((s, idx) => (
              <div key={idx} className="mb-2 d-flex align-items-start">
                <div style={{flex:1}}>
                  <input className="form-control mb-1" placeholder={t('skill_title')||'Título'} value={s.title} onChange={e=>updateSkill(idx,{ title: e.target.value })} />
                  <input className="form-control" placeholder={t('skill_subtitle')||'Subtítulo'} value={s.subtitleKey} onChange={e=>updateSkill(idx,{ subtitleKey: e.target.value })} />
                </div>
                <div className="ms-2" style={{width:160}}>
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" checked={s.visible} onChange={e=>updateSkill(idx,{ visible: e.target.checked })} />
                    <span className="form-check-label">{t('visible')||'Mostrar'}</span>
                  </label>
                  <button type="button" className="btn btn-sm btn-danger mt-2" onClick={()=>removeSkill(idx)}>{t('remove')||'Remover'}</button>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addSkill}>{t('add_skill')||'Adicionar habilidade'}</button>
          </div>

          <div className="mb-3">
            <h4>{t('profile_certifications') || 'Certificações'}</h4>
            {certifications.map((c, idx) => (
              <div key={idx} className="mb-2 d-flex align-items-start">
                <div style={{flex:1}}>
                  <input className="form-control mb-1" placeholder={t('cert_title')||'Título'} value={c.title} onChange={e=>updateCert(idx,{ title: e.target.value })} />
                  <input className="form-control" placeholder={t('cert_subtitle')||'Subtítulo'} value={c.subtitleKey} onChange={e=>updateCert(idx,{ subtitleKey: e.target.value })} />
                </div>
                <div className="ms-2" style={{width:160}}>
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" checked={c.visible} onChange={e=>updateCert(idx,{ visible: e.target.checked })} />
                    <span className="form-check-label">{t('visible')||'Mostrar'}</span>
                  </label>
                  <button type="button" className="btn btn-sm btn-danger mt-2" onClick={()=>removeCert(idx)}>{t('remove')||'Remover'}</button>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addCert}>{t('add_cert')||'Adicionar certificação'}</button>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">{t('save')||'Guardar'}</button>
            <button type="button" className="btn btn-secondary" onClick={()=>navigate('/profile')}>{t('cancel')||'Cancelar'}</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
